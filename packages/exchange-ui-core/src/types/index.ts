import { ICoreState } from '@energyweb/origin-ui-core';
import { IOrdersState } from '../features/orders';
import { IBundlesState } from '../features/bundles';
import { IExchangeGeneralState } from '../features/general';

export interface IStoreState extends ICoreState {
    exchangeGeneralState: IExchangeGeneralState;
    bundlesState: IBundlesState;
    ordersState: IOrdersState;
}
