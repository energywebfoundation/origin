import { apply, select, put, take, all, fork, call } from 'redux-saga/effects';
import { IUser, UserStatus } from '@energyweb/origin-backend-core';
import { IExchangeClient, Order, Demand } from '../../utils/exchange';
import { getExchangeClient } from '..';
import { SagaIterator } from 'redux-saga';
import { clearOrders, storeOrder, OrdersActionsType, storeDemand, clearDemands } from './actions';
import { BigNumber } from 'ethers';
import { showNotification, NotificationType } from '../..';
import { getI18n } from 'react-i18next';
import { reloadCertificates } from '../certificates';
import { getUserOffchain } from '../users/selectors';

export function* fetchOrders(): SagaIterator {
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

function* createBid(): SagaIterator {
    while (true) {
        const { payload } = yield take(OrdersActionsType.CREATE_BID);
        const exchangeClient: IExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();
        try {
            yield apply(exchangeClient, exchangeClient.createBid, [payload]);
            yield put(reloadCertificates());
            showNotification(i18n.t('exchange.feedback.bidPlaced'), NotificationType.Success);
            yield call(fetchOrders);
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
            yield call(fetchOrders);
        } catch (err) {
            console.error(err);
            showNotification(i18n.t('general.feedback.unknownError'), NotificationType.Error);
        }
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
            yield call(fetchOrders);
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
            yield apply(exchangeClient, exchangeClient.updateDemand, [payload.id, payload.demand]);
            yield put(reloadCertificates());
            showNotification(i18n.t('demand.feedback.demandUpdated'), NotificationType.Success);
            yield call(fetchOrders);
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
            yield call(fetchOrders);
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
            yield call(fetchOrders);
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
            yield call(fetchOrders);
        } catch (error) {
            console.error(error);
            showNotification(i18n.t('demand.feedback.pauseDemand'), NotificationType.Error);
        }
    }
}

export function* ordersSaga(): SagaIterator {
    yield all([fork(cancelOrder)]);
    yield all([fork(archiveDemand)]);
    yield all([fork(createBid)]);
    yield all([fork(createDemand)]);
    yield all([fork(updateDemand)]);
    yield all([fork(pauseDemand)]);
    yield all([fork(resumeDemand)]);
}
