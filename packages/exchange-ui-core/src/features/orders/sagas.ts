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
    storeOrders,
    OrdersActionsType,
    storeDemands,
    clearDemands,
    fetchOrders,
    ICreateDemandAction
} from './actions';
import { Order, Demand, ExchangeClient } from '../../utils/exchange';

function* fetchOrdersAndDemands(): SagaIterator {
    while (true) {
        yield take(OrdersActionsType.FETCH_ORDERS);
        yield put(clearOrders());
        yield put(clearDemands());

        const exchangeClient: ExchangeClient = yield select(getExchangeClient);
        const ordersClient = exchangeClient?.ordersClient;
        const demandClient = exchangeClient?.demandClient;
        const user: IUser = yield select(getUserOffchain);

        const ordersResponse =
            user && user.status === UserStatus.Active
                ? yield apply(ordersClient, ordersClient.getMyOrders, null)
                : { data: [] };
        const orders: Order[] = ordersResponse.data;

        const demandsResponse =
            user && user.status === UserStatus.Active
                ? yield apply(demandClient, demandClient.getAll, null)
                : { data: [] };

        const demands: Demand[] = demandsResponse.data;

        yield put(storeDemands(demands));
        if (orders.length > 0) {
            const ordersWithFilledInfo = orders.map((order) => {
                const { startVolume, currentVolume } = order;
                const filled =
                    BigNumber.from(startVolume)
                        .sub(BigNumber.from(currentVolume))
                        .mul(100)
                        .div(startVolume)
                        .toNumber() / 100;
                return { ...order, filled };
            });

            yield put(storeOrders(ordersWithFilledInfo));
        }
    }
}

function* createBid(): SagaIterator {
    while (true) {
        const { payload } = yield take(OrdersActionsType.CREATE_BID);
        const { ordersClient }: ExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();
        try {
            yield apply(ordersClient, ordersClient.createBid, [payload]);
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
        const {
            payload: { id: orderId }
        } = yield take(OrdersActionsType.CANCEL_ORDER);

        const { ordersClient }: ExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();
        try {
            yield apply(ordersClient, ordersClient.cancelOrder, [orderId]);
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
        const { ordersClient }: ExchangeClient = yield select(getExchangeClient);
        yield put(setLoading(true));
        const i18n = getI18n();

        try {
            yield apply(ordersClient, ordersClient.directBuy, [payload]);
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
        const { payload }: ICreateDemandAction = yield take(OrdersActionsType.CREATE_DEMAND);
        const { demandClient }: ExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();
        try {
            yield apply(demandClient, demandClient.create, [payload]);
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
        const { demandClient }: ExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();
        try {
            yield apply(demandClient, demandClient.replace, [payload.id, payload.demand]);
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
        const { demandClient }: ExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();
        try {
            yield apply(demandClient, demandClient.pause, [payload]);
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
        const { demandClient }: ExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();
        try {
            yield apply(demandClient, demandClient.resume, [payload]);
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
        const { demandClient }: ExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();
        try {
            yield apply(demandClient, demandClient.archive, [payload]);
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
