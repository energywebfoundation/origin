import BN from 'bn.js';

import { Product } from './Product';

export enum OrderSide {
    Bid,
    Ask
}

export enum OrderStatus {
    Active,
    Cancelled,
    Filled,
    PartiallyFilled,
    PendingCancellation
}

export interface IOrder {
    id: string;
    side: OrderSide;
    status: OrderStatus;
    validFrom: Date;
    product: Product;
    price: number;
    volume: BN;
}

export abstract class Order implements IOrder {
    private _volume: BN;

    private _status: OrderStatus;

    public get volume() {
        return this._volume;
    }

    public get status() {
        return this._status;
    }

    protected constructor(
        public readonly id: string,
        public readonly side: OrderSide,
        status: OrderStatus,
        public readonly validFrom: Date,
        public readonly product: Product,
        public readonly price: number,
        volume: BN,
        public readonly userId: string
    ) {
        this._status = status;
        this._volume = volume;
    }

    public updateWithTradedVolume(tradedVolume: BN) {
        if (tradedVolume.gt(this.volume)) {
            throw new Error('Order overmatched');
        }
        this._volume = this._volume.sub(tradedVolume);
        this._status = this.volume.isZero() ? OrderStatus.Filled : OrderStatus.PartiallyFilled;

        return this;
    }
}
