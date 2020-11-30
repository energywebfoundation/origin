import { IUser, IPublicOrganization } from '@energyweb/origin-backend-core';
import { Certificate, Contracts, IBlockchainProperties } from '@energyweb/issuer';
import { getI18n } from 'react-i18next';
import { SagaIterator } from 'redux-saga';
import { all, apply, call, delay, fork, put, select, take } from 'redux-saga/effects';

import {
    CertificateSource,
    updateCertificate,
    IResyncCertificateAction,
    clearCertificates,
    reloadCertificates
} from '.';
import { moment, NotificationType, showNotification } from '../../utils';
import { ExchangeClient } from '../../utils/clients/ExchangeClient';

import { assertCorrectBlockchainAccount } from '../../utils/sagas';
import { setLoading } from '../general/actions';
import { getExchangeClient } from '../general/selectors';
import { getConfiguration, getWeb3 } from '../selectors';
import { getUserOffchain } from '../users/selectors';
import {
    addCertificate,
    CertificatesActions,
    hideRequestCertificatesModal,
    IRequestCertificateApprovalAction,
    IRequestCertificatesAction,
    IRequestClaimCertificateAction,
    IRequestClaimCertificateBulkAction,
    IRequestPublishForSaleAction,
    IShowRequestCertificatesModalAction,
    setRequestCertificatesModalVisibility,
    IRequestWithdrawCertificateAction,
    IRequestCertificateEntityFetchAction
} from './actions';
import {
    getBlockchainPropertiesClient,
    getCertificateById,
    getCertificates,
    getCertificatesClient,
    getCertificationRequestsClient
} from './selectors';
import {
    BlockchainPropertiesClient,
    CertificatesClient,
    CertificationRequestsClient
} from '@energyweb/issuer-api-client';
import { ICertificate, ICertificateViewItem } from './types';
import { enhanceCertificate, fetchDataAfterConfigurationChange } from '../general/sagas';
import { certificateEnergyStringToBN } from '../../utils/certificates';
import { ContractReceipt, ContractTransaction, ethers } from 'ethers';

export function* getCertificate(id: number, byTokenId = false): any {
    const certificatesClient: CertificatesClient = yield select(getCertificatesClient);

    const { data: certificate } = yield apply(
        certificatesClient,
        byTokenId ? certificatesClient.getByTokenId : certificatesClient.get,
        [id]
    );

    return {
        ...certificate,
        energy: certificateEnergyStringToBN(certificate.energy)
    };
}

export function* getBlockchainCertificate(id: number): any {
    const blockchainPropertiesClient: BlockchainPropertiesClient = yield select(
        getBlockchainPropertiesClient
    );

    const { data: blockchainProperties } = yield apply(
        blockchainPropertiesClient,
        blockchainPropertiesClient.get,
        []
    );

    const web3: ethers.providers.JsonRpcProvider = yield select(getWeb3);

    const configuration: IBlockchainProperties = {
        web3,
        registry: Contracts.factories.RegistryFactory.connect(blockchainProperties.registry, web3),
        issuer: Contracts.factories.IssuerFactory.connect(blockchainProperties.issuer, web3),
        activeUser: web3.getSigner()
    };

    const certificate = new Certificate(id, configuration);

    yield call([certificate, certificate.sync]);

    return certificate;
}

function* requestCertificatesSaga(): SagaIterator {
    while (true) {
        const action: IRequestCertificatesAction = yield take(
            CertificatesActions.requestCertificates
        );

        yield put(setLoading(true));
        yield put(hideRequestCertificatesModal());

        const { startTime, endTime, energy, files, deviceId } = action.payload;

        try {
            const certificationRequestsClient: CertificationRequestsClient = yield select(
                getCertificationRequestsClient
            );
            const { accountClient }: ExchangeClient = yield select(getExchangeClient);
            const {
                data: { address }
            } = yield call([accountClient, accountClient.getAccount]);

            yield apply(certificationRequestsClient, certificationRequestsClient.create, [
                {
                    to: address,
                    energy: energy.toString(),
                    fromTime: startTime,
                    toTime: endTime,
                    deviceId,
                    files,
                    isPrivate: false
                }
            ]);

            showNotification(`Certificates requested.`, NotificationType.Success);
        } catch (error) {
            console.warn('Error while requesting certificates', error);

            let errorMsg;

            switch (error?.response?.status) {
                case 409:
                    errorMsg = `There is already a certificate requested for that time period.`;
                    break;
                case 412:
                    errorMsg = `Only Active users can request certificates.`;
                    break;
                default:
                    errorMsg = `Transaction could not be completed.`;
            }

            showNotification(errorMsg, NotificationType.Error);
        }

        yield put(setLoading(false));
    }
}

function* openRequestCertificatesModalSaga(): SagaIterator {
    while (true) {
        const action: IShowRequestCertificatesModalAction = yield take(
            CertificatesActions.showRequestCertificatesModal
        );
        const device = action.payload.producingDevice;

        const userOffchain: IUser = yield select(getUserOffchain);

        if ((device?.organization as IPublicOrganization).id !== userOffchain?.organization?.id) {
            showNotification(
                `You need to own the device to request certificates.`,
                NotificationType.Error
            );
        } else {
            yield put(setRequestCertificatesModalVisibility(true));
        }
    }
}

function* fetchCertificateSaga(id: number, entitiesBeingFetched: any): SagaIterator {
    if (entitiesBeingFetched.has(id)) {
        return;
    }

    const entities: ICertificateViewItem[] = yield select(getCertificates);

    const existingEntity: ICertificateViewItem = yield call(getCertificateById, entities, id);

    entitiesBeingFetched.set(id, true);

    try {
        if (existingEntity?.source === CertificateSource.Blockchain) {
            const fetchedCertificate: ICertificate = yield call(getCertificate, id);

            if (fetchedCertificate) {
                yield put(
                    addCertificate({
                        ...fetchedCertificate,
                        source: CertificateSource.Blockchain
                    })
                );
            }
        }
    } catch (error) {
        console.error('Error while fetching certificate', error);
    }

    entitiesBeingFetched.delete(id);
}

function* resyncCertificateSaga(): SagaIterator {
    while (true) {
        const action: IResyncCertificateAction = yield take(CertificatesActions.resyncCertificate);

        if (!action.payload) {
            continue;
        }

        const { id, assetId } = action.payload;

        const certificate: ICertificate = yield call(getCertificate, id);
        const { accountClient }: ExchangeClient = yield select(getExchangeClient);
        const user = yield select(getUserOffchain);

        const { data: exchangeAccount } = yield apply(
            accountClient,
            accountClient.getAccount,
            null
        );

        const asset = exchangeAccount.balances.available.find((a) => a.asset.id === assetId);
        yield put(
            updateCertificate(enhanceCertificate(certificate, user.blockchainAccountAddress, asset))
        );
    }
}

function* requestCertificateSaga(): SagaIterator {
    const entitiesBeingFetched = new Map<string, boolean>();

    while (true) {
        const action: IRequestCertificateEntityFetchAction = yield take(
            CertificatesActions.requestCertificateEntityFetch
        );

        if (!action.payload) {
            continue;
        }

        const entityId = action.payload;

        try {
            yield fork(fetchCertificateSaga, entityId, entitiesBeingFetched);
        } catch (error) {
            console.error('requestCertificateSaga: error', error);
        }
    }
}

function* requestPublishForSaleSaga(): SagaIterator {
    while (true) {
        const action: IRequestPublishForSaleAction = yield take(
            CertificatesActions.requestPublishForSale
        );
        const { accountClient, transferClient, ordersClient }: ExchangeClient = yield select(
            getExchangeClient
        );

        const certificatesClient: CertificatesClient = yield select(getCertificatesClient);

        const { amount, certificateId, callback, price, source } = action.payload;
        let { assetId } = action.payload;

        const i18n = getI18n();

        yield put(setLoading(true));

        try {
            if (source === CertificateSource.Blockchain) {
                const { data: account } = yield call([accountClient, accountClient.getAccount]);

                const { data: certificate } = yield apply(
                    certificatesClient,
                    certificatesClient.get,
                    [certificateId]
                );

                const onChainCertificate: Certificate = yield call(
                    getBlockchainCertificate,
                    certificate.tokenId
                );

                const transferResult: ContractTransaction = yield call(
                    [onChainCertificate, onChainCertificate.transfer],
                    account.address,
                    amount
                );

                while (true) {
                    const { data: transfers } = yield call([
                        transferClient,
                        transferClient.getMyTransfers
                    ]);

                    const transfer = transfers.find(
                        (item) => item.transactionHash === transferResult.hash
                    );
                    if (transfer) {
                        assetId = transfer.asset.id;
                        break;
                    }

                    yield delay(1000);
                }
            }

            yield call([ordersClient, ordersClient.createAsk], {
                assetId,
                price,
                volume: amount.toString(),
                validFrom: moment().toISOString()
            });
            yield put(reloadCertificates());
            showNotification(
                i18n.t('certificate.feedback.certificatePublished'),
                NotificationType.Success
            );
        } catch (error) {
            console.error(error);
            showNotification(i18n.t('general.feedback.unknownError'), NotificationType.Error);
        }

        yield put(setLoading(false));

        if (callback) {
            yield call(callback);
        }
    }
}

function* requestDepositSaga(): SagaIterator {
    while (true) {
        const action: IRequestPublishForSaleAction = yield take(
            CertificatesActions.requestDepositCertificate
        );
        const { accountClient }: ExchangeClient = yield select(getExchangeClient);

        const shouldContinue: boolean = yield call(assertCorrectBlockchainAccount);

        if (!shouldContinue) {
            continue;
        }
        const certificatesClient: CertificatesClient = yield select(getCertificatesClient);

        const { amount, certificateId, callback } = action.payload;

        const i18n = getI18n();

        yield put(setLoading(true));

        try {
            const { data: account } = yield call([accountClient, accountClient.getAccount]);

            const { data: certificate } = yield apply(certificatesClient, certificatesClient.get, [
                certificateId
            ]);

            const onChainCertificate: Certificate = yield call(
                getBlockchainCertificate,
                certificate.tokenId
            );

            yield call([onChainCertificate, onChainCertificate.transfer], account.address, amount);

            showNotification(
                i18n.t('certificate.feedback.certificateDeposited'),
                NotificationType.Success
            );
        } catch (error) {
            console.error(error);
            showNotification(i18n.t('general.feedback.unknownError'), NotificationType.Error);
        }

        yield put(setLoading(false));

        if (callback) {
            yield call(callback);
        }
    }
}

function* requestClaimCertificateSaga(): SagaIterator {
    while (true) {
        const action: IRequestClaimCertificateAction = yield take(
            CertificatesActions.requestClaimCertificate
        );

        const shouldContinue: boolean = yield call(assertCorrectBlockchainAccount);

        if (!shouldContinue) {
            continue;
        }

        const { certificateId, amount, claimData } = action.payload;

        yield put(setLoading(true));

        const i18n = getI18n();

        const certificatesClient: CertificatesClient = yield select(getCertificatesClient);

        try {
            const { data: certificate } = yield apply(certificatesClient, certificatesClient.get, [
                certificateId
            ]);

            const onChainCertificate: Certificate = yield call(
                getBlockchainCertificate,
                certificate.tokenId
            );

            const claimResult: ContractReceipt = yield call(
                [onChainCertificate, onChainCertificate.claim],
                claimData,
                amount
            );

            if (!claimResult.status) {
                showNotification('Claiming failed.', NotificationType.Error);
                continue;
            }

            showNotification(
                i18n.t('certificate.feedback.claimed', { id: certificateId }),
                NotificationType.Success
            );
            yield put(reloadCertificates());
        } catch (error) {
            console.error(error);
            showNotification(i18n.t('general.feedback.unknownError'), NotificationType.Error);
        }

        yield put(setLoading(false));
    }
}

function* requestClaimCertificateBulkSaga(): SagaIterator {
    while (true) {
        const action: IRequestClaimCertificateBulkAction = yield take(
            CertificatesActions.requestClaimCertificateBulk
        );

        const shouldContinue: boolean = yield call(assertCorrectBlockchainAccount);

        if (!shouldContinue) {
            continue;
        }

        const certificatesClient: CertificatesClient = yield select(getCertificatesClient);
        const { certificateIds, claimData } = action.payload;

        const i18n = getI18n();

        yield put(setLoading(true));

        try {
            yield apply(certificatesClient, certificatesClient.bulkClaim, [
                {
                    certificateIds: certificateIds.map((id) => id),
                    claimData
                }
            ]);
            yield put(reloadCertificates());

            showNotification(
                i18n.t('certificate.feedback.certificatesClaimed'),
                NotificationType.Success
            );
        } catch (error) {
            console.error(error);
            showNotification(i18n.t('general.feedback.unknownError'), NotificationType.Error);
        }

        yield put(setLoading(false));
    }
}

function* requestCertificateApprovalSaga(): SagaIterator {
    while (true) {
        const action: IRequestCertificateApprovalAction = yield take(
            CertificatesActions.requestCertificateApproval
        );

        const certificationRequestsClient: CertificationRequestsClient = yield select(
            getCertificationRequestsClient
        );

        const { certificationRequestId, callback } = action.payload;

        const i18n = getI18n();

        yield put(setLoading(true));

        try {
            yield apply(certificationRequestsClient, certificationRequestsClient.approve, [
                certificationRequestId
            ]);

            showNotification(i18n.t('certificate.feedback.approved'), NotificationType.Success);
        } catch (error) {
            console.error(error);
            showNotification(i18n.t('general.feedback.unknownError'), NotificationType.Error);
        }

        yield put(setLoading(false));

        if (callback) {
            yield call(callback);
        }
    }
}

export function* withdrawSaga(): SagaIterator {
    while (true) {
        const action: IRequestWithdrawCertificateAction = yield take(
            CertificatesActions.withdrawCertificate
        );
        const { callback } = action.payload;
        const { transferClient }: ExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();
        try {
            yield call([transferClient, transferClient.requestWithdrawal], action.payload);
            if (callback) {
                yield call(callback);
            }
            showNotification(i18n.t('certificate.feedback.withdrawn'), NotificationType.Success);
        } catch (error) {
            console.error(error);
            showNotification(i18n.t('general.feedback.unknownError'), NotificationType.Error);
        }
    }
}

function* reloadCertificatesSaga(): SagaIterator {
    while (true) {
        yield take(CertificatesActions.reloadCertificates);
        yield put(clearCertificates());
        const configuration = yield select(getConfiguration);
        if (!configuration) {
            continue;
        }
        yield call(fetchDataAfterConfigurationChange, configuration);
    }
}

export function* certificatesSaga(): SagaIterator {
    yield all([
        fork(requestCertificatesSaga),
        fork(openRequestCertificatesModalSaga),
        fork(requestCertificateSaga),
        fork(requestPublishForSaleSaga),
        fork(requestClaimCertificateSaga),
        fork(requestClaimCertificateBulkSaga),
        fork(requestCertificateApprovalSaga),
        fork(resyncCertificateSaga),
        fork(withdrawSaga),
        fork(requestDepositSaga),
        fork(reloadCertificatesSaga)
    ]);
}
