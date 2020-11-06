import { ICoreState } from '@energyweb/origin-ui-core';
import { IOrdersState } from '../features/orders';
import { IBundlesState } from '../features/bundles';

export interface IStoreState extends ICoreState {
    bundlesState: IBundlesState;
    ordersState: IOrdersState;
}
