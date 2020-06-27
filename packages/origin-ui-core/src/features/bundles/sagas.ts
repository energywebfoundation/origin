import { all, fork, take, apply, select, call } from 'redux-saga/effects';
import { BundlesActionType } from '.';
import { IExchangeClient } from '../../utils/exchange';
import { getExchangeClient } from '..';
import { fetchBundles } from '../general/sagas';
import { SagaIterator } from 'redux-saga';

function* cancelBundle(): SagaIterator {
    while (true) {
        const action = yield take(BundlesActionType.CANCEL_BUNDLE);
        const { payload } = action;
        const exchangeClient: IExchangeClient = yield select(getExchangeClient);
        yield apply(exchangeClient, exchangeClient.cancelBundle, payload);
        yield call(fetchBundles);
    }
}

export function* bundlesSaga(): SagaIterator {
    yield all([fork(cancelBundle)]);
}
