import { Certificate, CertificateUtils, CertificationRequest } from '@energyweb/issuer';
import { CommitmentStatus, IUser, IOrganization } from '@energyweb/origin-backend-core';
import { Configuration } from '@energyweb/utils-general';
import { ContractTransaction } from 'ethers';
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
import { IStoreState } from '../../types';
import { moment, NotificationType, showNotification } from '../../utils';
import { ExchangeAccount, IExchangeClient, ITransfer } from '../../utils/exchange';
import { assertCorrectBlockchainAccount } from '../../utils/sagas';
import { setLoading } from '../general/actions';
import { getExchangeClient } from '../general/selectors';
import { getConfiguration } from '../selectors';
import { getUserOffchain } from '../users/selectors';
import {
    addCertificate,
    CertificatesActions,
    hideRequestCertificatesModal,
    ICertificateFetcher,
    IRequestCertificateApprovalAction,
    IRequestCertificateEntityFetchAction,
    IRequestCertificatesAction,
    IRequestClaimCertificateAction,
    IRequestClaimCertificateBulkAction,
    IRequestPublishForSaleAction,
    IShowRequestCertificatesModalAction,
    setRequestCertificatesModalVisibility,
    IRequestWithdrawCertificateAction
} from './actions';
import { getCertificateById, getCertificateFetcher, getCertificates } from './selectors';
import { ICertificateViewItem } from './types';
import { enhanceCertificate, fetchDataAfterConfigurationChange } from '../general/sagas';

function assertIsContractTransaction(
    data: ContractTransaction | CommitmentStatus
): asserts data is ContractTransaction {
    if (typeof data === 'number' || !data.hash) {
        throw new Error(`Data.hash is not present`);
    }
}

export function* getCertificate(id: number) {
    const configuration: Configuration.Entity = yield select(getConfiguration);

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
        const configuration: IStoreState['configuration'] = yield select(getConfiguration);

        const { startTime, endTime, energy, files, deviceId } = action.payload;

        try {
            const shouldContinue: boolean = yield call(assertCorrectBlockchainAccount);

            if (shouldContinue) {
                const exchangeClient: IExchangeClient = yield select(getExchangeClient);
                const { address } = yield call([exchangeClient, exchangeClient.getAccount]);

                yield apply(CertificationRequest, CertificationRequest.create, [
                    startTime,
                    endTime,
                    energy,
                    deviceId,
                    configuration,
                    files,
                    false,
                    address
                ]);

                showNotification(`Certificates requested.`, NotificationType.Success);
            }
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

        if ((device?.organization as IOrganization).id !== userOffchain?.organization?.id) {
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

    const configuration: IStoreState['configuration'] = yield select(getConfiguration);
    const fetcher: ICertificateFetcher = yield select(getCertificateFetcher);

    entitiesBeingFetched.set(id, true);

    try {
        if (existingEntity?.source === CertificateSource.Blockchain) {
            const fetchedEntity: Certificate = yield call(fetcher.fetch, id, configuration);

            if (fetchedEntity) {
                yield put(
                    addCertificate({
                        ...fetchedEntity,
                        isClaimed: fetchedEntity.isClaimed,
                        isOwned: fetchedEntity.isOwned,
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

        const certificate: Certificate = yield call(getCertificate, id);
        const exchangeClient: IExchangeClient = yield select(getExchangeClient);

        const exchangeAccount: ExchangeAccount = yield apply(
            exchangeClient,
            exchangeClient.getAccount,
            null
        );

        const asset = exchangeAccount.balances.available.find((a) => a.asset.id === assetId);
        if (asset) {
            yield put(updateCertificate(enhanceCertificate(asset, certificate)));
        } else {
            const enhancedCertificate: ICertificateViewItem = Object.assign(certificate, {
                source: CertificateSource.Blockchain
            });
            yield put(updateCertificate(enhancedCertificate));
        }
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
        const exchangeClient: IExchangeClient = yield select(getExchangeClient);

        if (!exchangeClient) {
            continue;
        }

        const shouldContinue: boolean = yield call(assertCorrectBlockchainAccount);

        if (!shouldContinue) {
            continue;
        }

        const { amount, certificateId, callback, price, source } = action.payload;
        let { assetId } = action.payload;

        const i18n = getI18n();

        yield put(setLoading(true));

        try {
            const account: ExchangeAccount = yield call([
                exchangeClient,
                exchangeClient.getAccount
            ]);

            if (source === CertificateSource.Blockchain) {
                const certificate: Certificate = yield call(getCertificate, certificateId);

                const transferResult: ContractTransaction | CommitmentStatus = yield call(
                    [certificate, certificate.transfer],
                    account.address,
                    amount
                );

                assertIsContractTransaction(transferResult);

                while (true) {
                    const transfers: ITransfer[] = yield call([
                        exchangeClient,
                        exchangeClient.getAllTransfers
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

            yield call([exchangeClient, exchangeClient.createAsk], {
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
        const exchangeClient: IExchangeClient = yield select(getExchangeClient);

        if (!exchangeClient) {
            continue;
        }

        const shouldContinue: boolean = yield call(assertCorrectBlockchainAccount);

        if (!shouldContinue) {
            continue;
        }

        const { amount, certificateId, callback } = action.payload;

        const i18n = getI18n();

        yield put(setLoading(true));

        try {
            const account: ExchangeAccount = yield call([
                exchangeClient,
                exchangeClient.getAccount
            ]);
            const certificate: Certificate = yield call(getCertificate, certificateId);

            const transferResult: ContractTransaction | CommitmentStatus = yield call(
                [certificate, certificate.transfer],
                account.address,
                amount
            );
            assertIsContractTransaction(transferResult);

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
        const certificate: Certificate = yield call(getCertificate, certificateId);

        const i18n = getI18n();

        if (!certificate || !certificate.isOwned) {
            showNotification(
                i18n.t('certificate.feedback.notOwner', { id: certificate.id }),
                NotificationType.Error
            );
            continue;
        }

        try {
            yield call([certificate, certificate.claim], claimData, amount);

            const updatedCertificate: Certificate = yield call(getCertificate, certificateId);
            yield put(
                updateCertificate(
                    Object.assign(updatedCertificate, {
                        source: CertificateSource.Blockchain
                    })
                )
            );

            showNotification(
                i18n.t('certificate.feedback.claimed', { id: certificate.id }),
                NotificationType.Success
            );
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

        const configuration: Configuration.Entity = yield select(getConfiguration);

        const shouldContinue: boolean = yield call(assertCorrectBlockchainAccount);

        if (!shouldContinue || !configuration) {
            continue;
        }

        const { certificateIds, claimData } = action.payload;

        const i18n = getI18n();

        yield put(setLoading(true));

        try {
            yield call(
                CertificateUtils.claimCertificates,
                certificateIds,
                claimData,
                configuration
            );

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

        const shouldContinue: boolean = yield call(assertCorrectBlockchainAccount);

        if (!shouldContinue) {
            continue;
        }

        const { certificationRequest, callback } = action.payload;

        const i18n = getI18n();

        yield put(setLoading(true));

        try {
            yield call([certificationRequest, certificationRequest.approve]);

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
        const exchangeClient: IExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();
        try {
            yield call([exchangeClient, exchangeClient.withdraw], action.payload);
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
