import BN from 'bn.js';

import { Bid } from './Bid';

export class DirectBuy extends Bid {
    constructor(
        id: string,
        userId: string,
        price: number,
        volume: BN,
        public readonly askId: string
    ) {
        super(id, price, volume, null, new Date(), userId);
    }
}
