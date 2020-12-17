import BN from 'bn.js';

import { IMatchableProduct } from './IMatchableProduct';

export enum OrderSide {
    Bid = 'Bid',
    Ask = 'Ask'
}

export enum OrderStatus {
    Active = 'Active',
    Cancelled = 'Cancelled',
    Filled = 'Filled',
    PartiallyFilled = 'PartiallyFilled',
    PendingCancellation = 'PendingCancellation',
    NotExecuted = 'NotExecuted'
}

export interface IOrder {
    id: string;
    side: OrderSide;
    validFrom: Date;
    price: number;
    volume: BN;
    userId: string;
    isFilled: boolean;
    createdAt: Date;
    assetId?: string;
}

export interface IMatchableOrder<TProduct, TProductFilter> extends IOrder {
    filterBy(productFilter: TProductFilter): boolean;
    matches(order: IMatchableOrder<TProduct, TProductFilter>): boolean;
    clone(): IMatchableOrder<TProduct, TProductFilter>;
    updateWithTradedVolume(tradedVolume: BN): IMatchableOrder<TProduct, TProductFilter>;
    product: TProduct;
}

export class Order<TProduct, TProductFilter> implements IMatchableOrder<TProduct, TProductFilter> {
    private _volume: BN;

    public get volume() {
        return this._volume;
    }

    public get isFilled() {
        return this.volume.isZero();
    }

    constructor(
        public readonly id: string,
        public readonly side: OrderSide,
        public readonly validFrom: Date,
        private readonly matchableProduct: IMatchableProduct<TProduct, TProductFilter>,
        public readonly price: number,
        volume: BN,
        public readonly userId: string,
        public readonly createdAt: Date,
        public readonly assetId?: string
    ) {
        if (volume.isZero() || volume.isNeg()) {
            throw new Error('Incorrect negative volume');
        }
        if (price <= 0) {
            throw new Error('Incorrect negative price');
        }

        this._volume = new BN(volume);
    }

    public updateWithTradedVolume(tradedVolume: BN) {
        if (tradedVolume.gt(this.volume)) {
            throw new Error('Order overmatched');
        }
        this._volume = this._volume.sub(tradedVolume);

        return this;
    }

    public filterBy(productFilter: TProductFilter): boolean {
        return this.matchableProduct.filter(productFilter);
    }

    public matches(order: Order<TProduct, TProductFilter>): boolean {
        return this.matchableProduct.matches(order.matchableProduct.product);
    }

    public clone(): Order<TProduct, TProductFilter> {
        return new Order(
            this.id,
            this.side,
            this.validFrom,
            this.matchableProduct,
            this.price,
            this.volume,
            this.userId,
            this.createdAt
        );
    }

    public get product(): TProduct {
        return this.matchableProduct.product;
    }
}
