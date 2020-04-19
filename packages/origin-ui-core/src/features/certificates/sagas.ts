import { put, take, all, fork, select, call, apply, delay } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import {
    CertificatesActions,
    IRequestCertificatesAction,
    IShowRequestCertificatesModalAction,
    setRequestCertificatesModalVisibility,
    hideRequestCertificatesModal,
    IRequestCertificateEntityFetchAction,
    ICertificateFetcher,
    addCertificate,
    updateCertificate,
    IRequestPublishForSaleAction,
    IRequestClaimCertificateAction,
    IRequestClaimCertificateBulkAction,
    IRequestCertificateApprovalAction
} from './actions';
import { IStoreState } from '../../types';
import { getConfiguration } from '../selectors';
import { showNotification, NotificationType, moment } from '../../utils';
import { getUserOffchain } from '../users/selectors';
import { setLoading } from '../general/actions';
import { getCertificates, getCertificateFetcher, getCertificateById } from './selectors';
import { Certificate, CertificationRequest, CertificateUtils } from '@energyweb/issuer';
import { IUserWithRelations, CommitmentStatus } from '@energyweb/origin-backend-core';
import { assertCorrectBlockchainAccount } from '../../utils/sagas';
import { getExchangeClient } from '../general/selectors';
import { IExchangeClient, ExchangeAccount, ITransfer } from '../../utils/exchange';
import { ContractTransaction } from 'ethers';
import { getI18n } from 'react-i18next';
import { Configuration } from '@energyweb/utils-general';

function assertIsContractTransaction(
    data: ContractTransaction | CommitmentStatus
): asserts data is ContractTransaction {
    if (typeof data === 'number' || !data.hash) {
        throw new Error(`Data.hash is not present`);
    }
}

function* getCertificate(id: number) {
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
                yield apply(CertificationRequest, CertificationRequest.create, [
                    startTime,
                    endTime,
                    energy,
                    deviceId,
                    configuration,
                    files
                ]);

                showNotification(`Certificates requested.`, NotificationType.Success);
            }
        } catch (error) {
            console.warn('Error while requesting certificates', error);
            showNotification(`Transaction could not be completed.`, NotificationType.Error);
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

        const userOffchain: IUserWithRelations = yield select(getUserOffchain);

        if (device?.organization !== userOffchain?.organization?.id) {
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

    const entities: Certificate[] = yield select(getCertificates);

    const existingEntity: Certificate = yield call(getCertificateById, entities, id);

    const configuration: IStoreState['configuration'] = yield select(getConfiguration);
    const fetcher: ICertificateFetcher = yield select(getCertificateFetcher);

    entitiesBeingFetched.set(id, true);

    try {
        if (existingEntity) {
            const reloadedEntity: Certificate = yield call(fetcher.reload, existingEntity);

            if (reloadedEntity) {
                yield put(updateCertificate(reloadedEntity));
            }
        } else {
            const fetchedEntity: Certificate = yield call(fetcher.fetch, id, configuration);

            if (fetchedEntity) {
                yield put(addCertificate(fetchedEntity));
            }
        }
    } catch (error) {
        console.error('Error while fetching certificate', error);
    }

    entitiesBeingFetched.delete(id);
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

        const { amount, certificateId, callback, price } = action.payload;

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

            let transfer: ITransfer;

            while (true) {
                const transfers: ITransfer[] = yield call([
                    exchangeClient,
                    exchangeClient.getAllTransfers
                ]);

                transfer = transfers.find((item) => item.transactionHash === transferResult.hash);

                if (transfer) {
                    break;
                }

                yield delay(1000);
            }

            yield call([exchangeClient, exchangeClient.createAsk], {
                assetId: transfer.asset.id,
                price,
                volume: amount.toString(),
                validFrom: moment().toISOString()
            });

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

function* requestClaimCertificateSaga(): SagaIterator {
    while (true) {
        const action: IRequestClaimCertificateAction = yield take(
            CertificatesActions.requestClaimCertificate
        );

        const shouldContinue: boolean = yield call(assertCorrectBlockchainAccount);

        if (!shouldContinue) {
            continue;
        }

        const { certificateId } = action.payload;
        const certificate: Certificate = yield call(getCertificate, certificateId);

        const i18n = getI18n();

        if (!certificate || !certificate.isOwned) {
            showNotification(
                i18n.t('certificate.feedback.notOwner', { id: certificate.id }),
                NotificationType.Error
            );
            continue;
        }

        yield put(setLoading(true));

        try {
            yield call([certificate, certificate.claim]);
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

        const { certificateIds } = action.payload;

        const i18n = getI18n();

        yield put(setLoading(true));

        try {
            yield call(CertificateUtils.claimCertificates, certificateIds, configuration);

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

export function* certificatesSaga(): SagaIterator {
    yield all([
        fork(requestCertificatesSaga),
        fork(openRequestCertificatesModalSaga),
        fork(requestCertificateSaga),
        fork(requestPublishForSaleSaga),
        fork(requestClaimCertificateSaga),
        fork(requestClaimCertificateBulkSaga),
        fork(requestCertificateApprovalSaga)
    ]);
}
