import BN from 'bn.js';

import { DirectBuy } from '.';
import { IOrder } from './Order';

export class Trade {
    constructor(
        public readonly bid: IOrder | DirectBuy,
        public readonly ask: IOrder,
        volume: BN,
        public readonly price: number
    ) {
        if (volume.isZero() || volume.isNeg()) {
            throw new Error('Negative or zero trade volume');
        }

        this.created = new Date();
        this.volume = new BN(volume);
    }

    public readonly created: Date;

    public readonly volume: BN;
}
