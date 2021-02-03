import { IOrdersState } from '../features/orders';
import { IBundlesState } from '../features/bundles';
import { IExchangeGeneralState } from '../features/general';

export interface IExchangeState {
    exchangeGeneralState: IExchangeGeneralState;
    bundlesState: IBundlesState;
    ordersState: IOrdersState;
}
