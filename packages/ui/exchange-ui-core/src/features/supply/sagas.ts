import { SagaIterator } from 'redux-saga';
import { all, fork, take, select, apply, put } from 'redux-saga/effects';
import { getI18n } from 'react-i18next';
import { SupplyDto } from '@energyweb/exchange-client';
import { showNotification, NotificationTypeEnum } from '@energyweb/origin-ui-core';
import { getExchangeClient } from '../general';
import { ExchangeClient } from '../../utils/exchange';
import { SupplyActions, storeSupplies, fetchSupplies } from './actions';
import { IUpdateSupplyAction, IRemoveSupplyAction, ICreateSupplyAction } from './types';

function* getAllSupplies(): SagaIterator {
    while (true) {
        yield take(SupplyActions.FETCH_SUPPLIES);
        const { supplyClient }: ExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();
        try {
            const { data: supplies }: { data: SupplyDto[] } = yield apply(
                supplyClient,
                supplyClient.findAll,
                null
            );
            yield put(storeSupplies(supplies));
        } catch (error) {
            showNotification(
                i18n.t('exchange.supply.fetchSupplyError'),
                NotificationTypeEnum.Error
            );
            console.log(error);
        }
    }
}

function* createNewSupply(): SagaIterator {
    while (true) {
        const { payload }: ICreateSupplyAction = yield take(SupplyActions.CREATE_SUPPLY);
        const { supplyClient }: ExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();
        try {
            yield apply(supplyClient, supplyClient.create, [payload]);
            yield put(fetchSupplies());
            showNotification(
                i18n.t('exchange.supply.supplyCreatedSuccess'),
                NotificationTypeEnum.Success
            );
        } catch (error) {
            showNotification(
                i18n.t('exchange.supply.supplyCreateError'),
                NotificationTypeEnum.Error
            );
            console.log(error);
        }
    }
}

function* updateExistingSupply(): SagaIterator {
    while (true) {
        const { payload }: IUpdateSupplyAction = yield take(SupplyActions.UPDATE_SUPPLY);
        const { supplyId, supplyData } = payload;
        const { supplyClient }: ExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();
        try {
            yield apply(supplyClient, supplyClient.update, [supplyId, supplyData]);
            yield put(fetchSupplies());
            showNotification(
                i18n.t('exchange.supply.supplyUpdatedSuccess'),
                NotificationTypeEnum.Success
            );
        } catch (error) {
            showNotification(
                i18n.t('exchange.supply.supplyUpdateError'),
                NotificationTypeEnum.Error
            );
            console.log(error);
        }
    }
}

function* removeSelectedSupply(): SagaIterator {
    while (true) {
        const { payload }: IRemoveSupplyAction = yield take(SupplyActions.REMOVE_SUPPLY);
        const { supplyClient }: ExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();
        try {
            yield apply(supplyClient, supplyClient.remove, [payload.supplyId]);
            yield put(fetchSupplies());
            showNotification(
                i18n.t('exchange.supply.supplyRemovedSuccess'),
                NotificationTypeEnum.Success
            );
        } catch (error) {
            showNotification(
                i18n.t('exchange.supply.supplyRemoveError'),
                NotificationTypeEnum.Error
            );
            console.log(error);
        }
    }
}

export function* supplySaga(): SagaIterator {
    yield all([
        fork(getAllSupplies),
        fork(createNewSupply),
        fork(updateExistingSupply),
        fork(removeSelectedSupply)
    ]);
}
