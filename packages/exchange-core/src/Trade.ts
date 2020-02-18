import BN from 'bn.js';

import { Order } from './Order';

export class Trade {
    constructor(bid: Order, ask: Order, public readonly volume: BN, public readonly price: number) {
        this.bidId = bid.id;
        this.askId = ask.id;
        this.created = new Date();
    }

    public readonly bidId: string;

    public readonly askId: string;

    public readonly created: Date;
}
