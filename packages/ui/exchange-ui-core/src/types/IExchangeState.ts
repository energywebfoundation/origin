import { IOrdersState } from '../features/orders';
import { IBundlesState } from '../features/bundles';
import { IExchangeGeneralState } from '../features/general';
import { ISupplyState } from '../features/supply/types';

export interface IExchangeState {
    exchangeGeneralState: IExchangeGeneralState;
    bundlesState: IBundlesState;
    ordersState: IOrdersState;
    supplyState: ISupplyState;
}
