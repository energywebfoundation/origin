import { put, take, all, fork, select, call, apply } from 'redux-saga/effects';
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
    updateCertificate
} from './actions';
import { IStoreState } from '../../types';
import { getConfiguration } from '../selectors';
import { showNotification, NotificationType } from '../../utils/notifications';
import { getUserOffchain, getActiveBlockchainAccountAddress } from '../users/selectors';
import { setLoading } from '../general/actions';
import { getCertificates, getCertificateFetcher, getCertificateById } from './selectors';
import { Certificate, CertificationRequest } from '@energyweb/issuer';
import { IUserWithRelations } from '@energyweb/origin-backend-core';

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
            yield apply(CertificationRequest, CertificationRequest.create, [
                startTime,
                endTime,
                energy,
                deviceId,
                configuration,
                files
            ]);

            showNotification(`Certificates requested.`, NotificationType.Success);
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
        const activeAddress: string = yield select(getActiveBlockchainAccountAddress);

        if (device?.organization !== userOffchain?.organization?.id) {
            showNotification(
                `You need to own the device to request certificates.`,
                NotificationType.Error
            );
        } else if (
            !activeAddress ||
            activeAddress?.toLowerCase() !== userOffchain?.blockchainAccountAddress?.toLowerCase()
        ) {
            showNotification(
                `You need to select a blockchain account bound to the logged in user.`,
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
    const usersBeingFetched = new Map<string, boolean>();

    while (true) {
        const action: IRequestCertificateEntityFetchAction = yield take(
            CertificatesActions.requestCertificateEntityFetch
        );

        if (!action.payload) {
            continue;
        }

        const entityId = action.payload;

        try {
            yield fork(fetchCertificateSaga, entityId, usersBeingFetched);
        } catch (error) {
            console.error('requestCertificateSaga: error', error);
        }
    }
}

export function* certificatesSaga(): SagaIterator {
    yield all([
        fork(requestCertificatesSaga),
        fork(openRequestCertificatesModalSaga),
        fork(requestCertificateSaga)
    ]);
}
