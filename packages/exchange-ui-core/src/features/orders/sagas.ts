import { SagaIterator } from 'redux-saga';
import { apply, select, put, take, all, fork } from 'redux-saga/effects';
import { getI18n } from 'react-i18next';
import { BigNumber } from 'ethers';
import { IUser, UserStatus } from '@energyweb/origin-backend-core';
import {
    showNotification,
    NotificationType,
    reloadCertificates,
    getUserOffchain,
    setLoading
} from '@energyweb/origin-ui-core';
import { getExchangeClient } from '../general/selectors';
import {
    clearOrders,
    storeOrder,
    OrdersActionsType,
    storeDemand,
    clearDemands,
    fetchOrders
} from './actions';
import { IExchangeClient, Order, Demand } from '../../utils/exchange';

function* fetchOrdersAndDemands(): SagaIterator {
    while (true) {
        yield take(OrdersActionsType.FETCH_ORDERS);
        yield put(clearOrders());
        yield put(clearDemands());
        const exchangeClient: IExchangeClient = yield select(getExchangeClient);
        const user: IUser = yield select(getUserOffchain);
        const orders: Order[] =
            user && user.status === UserStatus.Active
                ? yield apply(exchangeClient, exchangeClient.getOrders, null)
                : [];
        const demands: Demand[] =
            user && user.status === UserStatus.Active
                ? yield apply(exchangeClient, exchangeClient.getAllDemands, null)
                : [];
        yield put(storeDemand(demands));
        for (const order of orders) {
            const { startVolume, currentVolume } = order;
            const filled =
                BigNumber.from(startVolume)
                    .sub(BigNumber.from(currentVolume))
                    .mul(100)
                    .div(startVolume)
                    .toNumber() / 100;
            yield put(storeOrder({ ...order, filled }));
        }
    }
}

function* createBid(): SagaIterator {
    while (true) {
        const { payload } = yield take(OrdersActionsType.CREATE_BID);
        const exchangeClient: IExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();
        try {
            yield apply(exchangeClient, exchangeClient.createBid, [payload]);
            yield put(reloadCertificates());
            showNotification(i18n.t('exchange.feedback.bidPlaced'), NotificationType.Success);
            yield put(fetchOrders());
        } catch (err) {
            console.error(err);
            showNotification(
                i18n.t('exchange.feedback.actionUnsuccessful'),
                NotificationType.Error
            );
        }
    }
}

function* cancelOrder(): SagaIterator {
    while (true) {
        const { payload } = yield take(OrdersActionsType.CANCEL_ORDER);
        const exchangeClient: IExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();
        try {
            yield apply(exchangeClient, exchangeClient.cancelOrder, [payload]);
            yield put(reloadCertificates());
            showNotification(i18n.t('order.feedback.orderCanceled'), NotificationType.Success);
            yield put(fetchOrders());
        } catch (err) {
            console.error(err);
            showNotification(i18n.t('general.feedback.unknownError'), NotificationType.Error);
        }
    }
}

function* buyDirect(): SagaIterator {
    while (true) {
        const { payload } = yield take(OrdersActionsType.DIRECT_BUY_ORDER);
        const exchangeClient: IExchangeClient = yield select(getExchangeClient);
        yield put(setLoading(true));
        const i18n = getI18n();

        try {
            yield apply(exchangeClient, exchangeClient.directBuy, [payload]);
            yield put(reloadCertificates());
            showNotification(
                i18n.t('exchange.feedback.directBuySuccess'),
                NotificationType.Success
            );
        } catch (error) {
            showNotification(i18n.t('exchange.feedback.directBuyError'), NotificationType.Error);
            console.error(error);
        }

        yield put(setLoading(false));
    }
}

function* createDemand(): SagaIterator {
    while (true) {
        const { payload } = yield take(OrdersActionsType.CREATE_DEMAND);
        const exchangeClient: IExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();
        try {
            yield apply(exchangeClient, exchangeClient.createDemand, [payload]);
            yield put(reloadCertificates());
            showNotification(i18n.t('exchange.feedback.demandPlaced'), NotificationType.Success);
            yield put(fetchOrders());
        } catch (err) {
            console.error(err);
            showNotification(
                i18n.t('exchange.feedback.actionUnsuccessful'),
                NotificationType.Error
            );
        }
    }
}

function* updateDemand(): SagaIterator {
    while (true) {
        const { payload } = yield take(OrdersActionsType.UPDATE_DEMAND);
        const exchangeClient: IExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();
        try {
            yield apply(exchangeClient, exchangeClient.replaceDemand, [payload.id, payload.demand]);
            yield put(reloadCertificates());
            showNotification(i18n.t('demand.feedback.demandUpdated'), NotificationType.Success);
            yield put(fetchOrders());
        } catch (err) {
            console.error(err);
            showNotification(i18n.t('general.feedback.unknownError'), NotificationType.Error);
        }
    }
}

function* pauseDemand(): SagaIterator {
    while (true) {
        const { payload } = yield take(OrdersActionsType.PAUSE_DEMAND);
        const exchangeClient: IExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();
        try {
            yield apply(exchangeClient, exchangeClient.pauseDemand, [payload]);
            showNotification(i18n.t('demand.feedback.demandPaused'), NotificationType.Success);
            yield put(fetchOrders());
        } catch (err) {
            console.error(err);
            showNotification(i18n.t('demand.feedback.statusNotChanged'), NotificationType.Error);
        }
    }
}

function* resumeDemand(): SagaIterator {
    while (true) {
        const { payload } = yield take(OrdersActionsType.RESUME_DEMAND);
        const exchangeClient: IExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();
        try {
            yield apply(exchangeClient, exchangeClient.resumeDemand, [payload]);
            showNotification(i18n.t('demand.feedback.demandActivated'), NotificationType.Success);
            yield put(fetchOrders());
        } catch (err) {
            console.error(err);
            showNotification(i18n.t('demand.feedback.statusNotChanged'), NotificationType.Error);
        }
    }
}

function* archiveDemand(): SagaIterator {
    while (true) {
        const { payload } = yield take(OrdersActionsType.ARCHIVE_DEMAND);
        const exchangeClient: IExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();
        try {
            yield apply(exchangeClient, exchangeClient.archiveDemand, [payload]);
            showNotification(
                i18n.t('demand.feedback.successfullyRemoved'),
                NotificationType.Success
            );
            yield put(fetchOrders());
        } catch (error) {
            console.error(error);
            showNotification(i18n.t('demand.feedback.pauseDemand'), NotificationType.Error);
        }
    }
}

export function* ordersSaga(): SagaIterator {
    yield all([
        fork(cancelOrder),
        fork(archiveDemand),
        fork(createBid),
        fork(createDemand),
        fork(updateDemand),
        fork(pauseDemand),
        fork(resumeDemand),
        fork(fetchOrdersAndDemands),
        fork(buyDirect)
    ]);
}
