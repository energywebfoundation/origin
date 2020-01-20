import { Product } from './Product';

export enum OrderSide {
    Bid,
    Ask
}

export enum OrderStatus {
    Active,
    Cancelled,
    Filled,
    PartiallyFilled
}

export abstract class Order {
    private _volume: number;

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
        public readonly validFrom: number,
        public readonly product: Product,
        public readonly price: number,
        volume: number
    ) {
        this._status = status;
        this._volume = volume;
    }

    public updateVolume(traded: number) {
        if (traded > this.volume) {
            throw new Error('Order overmatched');
        }
        this._volume -= traded;
        this._status = this.volume === 0 ? OrderStatus.Filled : OrderStatus.PartiallyFilled;

        return this;
    }
}
