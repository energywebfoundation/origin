import BN from 'bn.js';

import { Bid } from './Bid';

export class DirectBuy extends Bid {
    constructor(
        id: string,
        userId: string,
        price: number,
        volume: BN,
        public readonly askId: string,
        createdAt: Date
    ) {
        super(id, price, volume, null, new Date(), userId, createdAt);
    }

    public clone(): DirectBuy {
        return new DirectBuy(
            this.id,
            this.userId,
            this.price,
            this.volume,
            this.askId,
            this.createdAt
        );
    }
}
