import { apply, select, put, take, all, fork, call } from 'redux-saga/effects';
import { IExchangeClient, Order } from '../../utils/exchange';
import { getExchangeClient } from '..';
import { SagaIterator } from 'redux-saga';
import { clearOrders, storeOrder, OrdersActionsType } from './actions';
import { BigNumber } from 'ethers/utils';
import { showNotification, NotificationType } from '../..';
import { getI18n } from 'react-i18next';

export function* fetchOrders(): SagaIterator {
    yield put(clearOrders());
    const exchangeClient: IExchangeClient = yield select(getExchangeClient);
    const orders: Order[] = yield apply(exchangeClient, exchangeClient.getOrders, null);
    for (const order of orders) {
        const { startVolume, currentVolume } = order;
        const filled =
            new BigNumber(startVolume)
                .sub(new BigNumber(currentVolume))
                .mul(100)
                .div(startVolume)
                .toNumber() / 100;
        yield put(storeOrder({ ...order, filled }));
    }
}

export function* removeOrder(): SagaIterator {
    while (true) {
        const { paylod: order } = yield take(OrdersActionsType.CANCEL);
        const exchangeClient: IExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();
        try {
            yield apply(exchangeClient, exchangeClient.cancelOrder, [order]);
            showNotification(i18n.t('order.feedback.orderCanceld'), NotificationType.Success);
            yield call(fetchOrders);
        } catch (err) {
            console.error(err);
            showNotification(i18n.t('general.feedback.unknownError'), NotificationType.Error);
        }
    }
}

export function* ordersSaga(): SagaIterator {
    yield all([fork(removeOrder)]);
}
