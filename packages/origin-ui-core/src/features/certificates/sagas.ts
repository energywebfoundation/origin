import { put, take, all, fork, select, call, apply, delay } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import {
    CertificatesActions,
    IAddCertificateAction,
    IRequestCertificatesAction,
    IShowRequestCertificatesModalAction,
    setRequestCertificatesModalVisibility,
    hideRequestCertificatesModal,
    IRequestCertificateEntityFetchAction,
    ICertificateFetcher,
    addCertificate,
    updateCertificate,
    requestCertificateEntityFetch,
    IUpdateCertificateAction
} from './actions';
import { requestUser } from '../users/actions';
import { IStoreState } from '../../types';
import { getConfiguration } from '../selectors';
import { showNotification, NotificationType } from '../../utils/notifications';
import { Role } from '@energyweb/user-registry';
import { MarketUser, PurchasableCertificate, NoneCurrency } from '@energyweb/market';
import { getCurrentUser } from '../users/selectors';
import { setLoading } from '../general/actions';
import { getCertificates, getCertificateFetcher, getCertificateById } from './selectors';
import { EnergyFormatter } from '../../utils/EnergyFormatter';
import { OffChainDataSource } from '@energyweb/origin-backend-client';
import { getOffChainDataSource } from '../general/selectors';

function areOffChainSettlementOptionsMissing(certificate: PurchasableCertificate.Entity) {
    return (
        certificate.forSale &&
        certificate.acceptedToken === '0x0000000000000000000000000000000000000000' &&
        (!certificate.offChainProperties ||
            (certificate.offChainProperties.currency === NoneCurrency &&
                certificate.offChainProperties.priceInCents === 0))
    );
}

function* fetchCertificateDetailsSaga(): SagaIterator {
    while (true) {
        const action: IAddCertificateAction | IUpdateCertificateAction = yield take([
            CertificatesActions.addCertificate,
            CertificatesActions.updateCertificate
        ]);

        const certificate = action.payload;

        yield put(requestUser(certificate.certificate.owner));

        if (areOffChainSettlementOptionsMissing(certificate)) {
            yield delay(100);
            yield put(requestCertificateEntityFetch(certificate.id));
        }
    }
}

function* requestCertificatesSaga(): SagaIterator {
    while (true) {
        const action: IRequestCertificatesAction = yield take(
            CertificatesActions.requestCertificates
        );

        yield put(setLoading(true));

        yield put(hideRequestCertificatesModal());

        const offChainDataSource: OffChainDataSource = yield select(getOffChainDataSource);

        try {
            yield apply(
                offChainDataSource.certificateClient,
                offChainDataSource.certificateClient.requestCertificates,
                [
                    {
                        device: parseInt(action.payload.deviceId, 10),
                        energy: action.payload.energy,
                        startTime: action.payload.startTime,
                        endTime: action.payload.endTime,
                        files: action.payload.files
                    }
                ]
            );

            showNotification(
                `Certificates for ${EnergyFormatter.format(
                    action.payload.energy,
                    true
                )} requested.`,
                NotificationType.Success
            );
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
        const currentUser: MarketUser.Entity = yield select(getCurrentUser);

        if (device?.owner?.address?.toLowerCase() !== currentUser?.id?.toLowerCase()) {
            showNotification(
                `You need to own the device to request certificates.`,
                NotificationType.Error
            );
        } else if (!currentUser.isRole(Role.DeviceManager)) {
            showNotification(
                `You need to have Device Manager role to request certificates.`,
                NotificationType.Error
            );
        } else {
            yield put(setRequestCertificatesModalVisibility(true));
        }
    }
}

function* fetchCertificateSaga(id: string, entitiesBeingFetched: any): SagaIterator {
    if (entitiesBeingFetched.has(id)) {
        return;
    }

    const entities: PurchasableCertificate.Entity[] = yield select(getCertificates);

    const existingEntity: PurchasableCertificate.Entity = yield call(
        getCertificateById,
        entities,
        id
    );

    const configuration: IStoreState['configuration'] = yield select(getConfiguration);
    const fetcher: ICertificateFetcher = yield select(getCertificateFetcher);

    entitiesBeingFetched.set(id, true);

    try {
        if (existingEntity) {
            const reloadedEntity: PurchasableCertificate.Entity = yield call(
                fetcher.reload,
                existingEntity
            );

            if (reloadedEntity) {
                yield put(updateCertificate(reloadedEntity));
            }
        } else {
            const fetchedEntity: PurchasableCertificate.Entity = yield call(
                fetcher.fetch,
                id,
                configuration
            );

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
    const usersBeingFetched = new Map<string, boolean>();

    while (true) {
        const action: IRequestCertificateEntityFetchAction = yield take(
            CertificatesActions.requestCertificateEntityFetch
        );

        if (!action.payload) {
            return;
        }

        const entityId = action.payload.toLowerCase();

        try {
            yield fork(fetchCertificateSaga, entityId, usersBeingFetched);
        } catch (error) {
            console.error('requestCertificateSaga: error', error);
        }
    }
}

export function* certificatesSaga(): SagaIterator {
    yield all([
        fork(fetchCertificateDetailsSaga),
        fork(requestCertificatesSaga),
        fork(openRequestCertificatesModalSaga),
        fork(requestCertificateSaga)
    ]);
}
