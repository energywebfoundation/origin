import { put, take, all, fork, select, call } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import {
    CertificatesActions,
    ICertificateCreatedOrUpdatedAction,
    IRequestCertificatesAction
} from './actions';
import { requestUser } from '../users/actions';
import { IStoreState } from '../../types';
import { getConfiguration } from '../selectors';
import { showNotification, NotificationType } from '../../utils/notifications';
import { Unit } from '@energyweb/utils-general';
import { Certificate } from '@energyweb/origin';

function* requestCertificateDetailsSaga(): SagaIterator {
    while (true) {
        const action: ICertificateCreatedOrUpdatedAction = yield take(
            CertificatesActions.certificateCreatedOrUpdated
        );

        yield put(requestUser(action.certificate.owner));
    }
}

function* requestCertificatesSaga(): SagaIterator {
    while (true) {
        const action: IRequestCertificatesAction = yield take(
            CertificatesActions.requestCertificates
        );

        const configuration: IStoreState['configuration'] = yield select(getConfiguration);

        yield call(
            Certificate.requestCertificates,
            action.payload.assetId,
            action.payload.lastReadIndex,
            configuration
        );

        const energyInKWh = action.payload.energy / Unit.kWh;

        showNotification(
            `Certificates for ${energyInKWh} kWh requested.`,
            NotificationType.Success
        );
    }
}

export function* certificatesSaga(): SagaIterator {
    yield all([fork(requestCertificateDetailsSaga), fork(requestCertificatesSaga)]);
}
