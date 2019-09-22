import { put, take, all, fork } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import { ProducingAssetsActions, IProducingAssetCreatedOrUpdatedAction } from './actions';
import { requestUser } from '../users/actions';

function* requestAssetDetailsSaga(): SagaIterator {
    while (true) {
        const action: IProducingAssetCreatedOrUpdatedAction = yield take(
            ProducingAssetsActions.producingAssetCreatedOrUpdated
        );

        yield put(requestUser(action.producingAsset.owner.address));
    }
}

export function* producingAssetsSaga(): SagaIterator {
    yield all([fork(requestAssetDetailsSaga)]);
}
