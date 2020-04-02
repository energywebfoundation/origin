import BN from 'bn.js';
import * as Moment from 'moment';
import { extendMoment } from 'moment-range';

import { Product } from './Product';

const moment = extendMoment(Moment);

export enum OrderSide {
    Bid,
    Ask
}

export interface IOrder {
    id: string;
    side: OrderSide;
    validFrom: Date;
    product: Product;
    price: number;
    volume: BN;
}

export abstract class Order implements IOrder {
    private _volume: BN;

    public get volume() {
        return this._volume;
    }

    public get isFilled() {
        return this.volume.isZero();
    }

    protected constructor(
        public readonly id: string,
        public readonly side: OrderSide,
        public readonly validFrom: Date,
        public readonly product: Product,
        public readonly price: number,
        volume: BN,
        public readonly userId: string
    ) {
        if (volume.isZero() || volume.isNeg()) {
            throw new Error('Incorrect negative volume');
        }
        if (price <= 0) {
            throw new Error('Incorrect negative price');
        }

        this._volume = volume;
    }

    public updateWithTradedVolume(tradedVolume: BN) {
        if (tradedVolume.gt(this.volume)) {
            throw new Error('Order overmatched');
        }
        this._volume = this._volume.sub(tradedVolume);

        return this;
    }

    public static hasMatchingGenerationTimes(bidProduct: Product, askProduct: Product) {
        const bidRange = moment.range(bidProduct.generationTime.from, bidProduct.generationTime.to);
        const askRange = moment.range(askProduct.generationTime.from, askProduct.generationTime.to);

        return bidRange.contains(askRange);
    }
}
