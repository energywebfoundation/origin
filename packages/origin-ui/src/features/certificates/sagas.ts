import { put, take, all, fork } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import { CertificatesActions, ICertificateCreatedOrUpdatedAction } from './actions';
import { requestUser } from '../users/actions';

function* requestCertificateDetailsSaga(): SagaIterator {
    while (true) {
        const action: ICertificateCreatedOrUpdatedAction = yield take(
            CertificatesActions.certificateCreatedOrUpdated
        );

        yield put(requestUser(action.certificate.owner));
    }
}

export function* certificatesSaga(): SagaIterator {
    yield all([fork(requestCertificateDetailsSaga)]);
}
