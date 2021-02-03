import BN from 'bn.js';
import { IOrder } from './IOrder';

export interface IMatchableOrder<TProduct, TProductFilter> extends IOrder {
    filterBy(productFilter: TProductFilter): boolean;
    matches(order: IMatchableOrder<TProduct, TProductFilter>): boolean;
    clone(): IMatchableOrder<TProduct, TProductFilter>;
    updateWithTradedVolume(tradedVolume: BN): IMatchableOrder<TProduct, TProductFilter>;
    product: TProduct;
}
