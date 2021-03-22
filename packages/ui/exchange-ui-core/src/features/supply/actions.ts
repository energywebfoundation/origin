import {
    ISupplyAction,
    IStoreSuppliesAction,
    ICreateSupplyAction,
    IUpdateSupplyAction,
    IRemoveSupplyAction
} from './types';

export enum SupplyActions {
    FETCH_SUPPLIES = 'EXCHANGE_APP_FETCH_SUPPLIES',
    STORE_SUPPLIES = 'EXCHANGE_APP_STORE_SUPPLIES',
    CREATE_SUPPLY = 'EXCHANGE_APP_CREATE_SUPPLY',
    UPDATE_SUPPLY = 'EXCHANGE_APP_UPDATE_SUPPLY',
    REMOVE_SUPPLY = 'EXCHANGE_APP_REMOVE_SUPPLY'
}

export const fetchSupplies = (): ISupplyAction => ({
    type: SupplyActions.FETCH_SUPPLIES
});

export const storeSupplies = (supplies: IStoreSuppliesAction['payload']): IStoreSuppliesAction => ({
    type: SupplyActions.STORE_SUPPLIES,
    payload: supplies
});

export const createSupply = (
    newSupplyData: ICreateSupplyAction['payload']
): ICreateSupplyAction => ({
    type: SupplyActions.CREATE_SUPPLY,
    payload: newSupplyData
});

export const updateSupply = (
    updateSupplyData: IUpdateSupplyAction['payload']
): IUpdateSupplyAction => ({
    type: SupplyActions.UPDATE_SUPPLY,
    payload: updateSupplyData
});

export const removeSupply = (
    removeSupplyData: IRemoveSupplyAction['payload']
): IRemoveSupplyAction => ({
    type: SupplyActions.REMOVE_SUPPLY,
    payload: removeSupplyData
});
