import BN from 'bn.js';

import { Ask, Bid, DirectBuy } from '.';

export class Trade {
    constructor(
        public readonly bid: Bid | DirectBuy,
        public readonly ask: Ask,
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
