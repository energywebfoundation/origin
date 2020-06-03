import BN from 'bn.js';

import { Ask, Bid, DirectBuy } from '.';

export class Trade {
    constructor(
        public readonly bid: Bid | DirectBuy,
        public readonly ask: Ask,
        public readonly volume: BN,
        public readonly price: number
    ) {
        this.created = new Date();
    }

    public readonly created: Date;
}
