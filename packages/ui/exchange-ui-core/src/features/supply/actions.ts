import {
    ISupplyAction,
    IStoreSuppliesAction,
    ICreateSupplyAction,
    IUpdateSupplyAction,
    IRemoveSupplyAction
} from './types';

export enum SupplyActions {
    FETCH_SUPPLIES = 'FETCH_SUPPLIES',
    STORE_SUPPLIES = 'STORE_SUPPLIES',
    CREATE_SUPPLY = 'CREATE_SUPPLY',
    UPDATE_SUPPLY = 'UPDATE_SUPPLY',
    REMOVE_SUPPLY = 'REMOVE_SUPPLY'
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
