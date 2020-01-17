import { put, take, all, fork } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import { ProducingDevicesActions, IProducingDeviceCreatedOrUpdatedAction } from './actions';
import { requestUser } from '../users/actions';

function* requestDeviceDetailsSaga(): SagaIterator {
    while (true) {
        const action: IProducingDeviceCreatedOrUpdatedAction = yield take(
            ProducingDevicesActions.producingDeviceCreatedOrUpdated
        );

        yield put(requestUser(action.producingDevice.owner.address));
    }
}

export function* producingDevicesSaga(): SagaIterator {
    yield all([fork(requestDeviceDetailsSaga)]);
}
