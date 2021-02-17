import { SupplyDto, CreateSupplyDto } from '@energyweb/exchange-client';
import { UpdateSupply, RemoveSupply } from '../../types';
import { SupplyActions } from './actions';

export interface ISupplyState {
    supplies: SupplyDto[];
}

export interface ISupplyAction {
    type: SupplyActions;
    payload?;
}

export interface IStoreSuppliesAction extends ISupplyAction {
    payload: SupplyDto[];
}
export interface ICreateSupplyAction extends ISupplyAction {
    payload: CreateSupplyDto;
}
export interface IUpdateSupplyAction extends ISupplyAction {
    payload: UpdateSupply;
}
export interface IRemoveSupplyAction extends ISupplyAction {
    payload: RemoveSupply;
}
