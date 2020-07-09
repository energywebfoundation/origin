import { apply, select, put } from 'redux-saga/effects';
import { IExchangeClient, Order } from '../../utils/exchange';
import { getExchangeClient } from '..';
import { SagaIterator } from 'redux-saga';
import { clearOrders, storeOrder } from './actions';

export function* fetchOrders(): SagaIterator {
    yield put(clearOrders());
    const exchangeClient: IExchangeClient = yield select(getExchangeClient);
    const orders: Order[] = yield apply(exchangeClient, exchangeClient.getOrders, null);
    for (const order of orders) {
        yield put(storeOrder(order));
    }
}
