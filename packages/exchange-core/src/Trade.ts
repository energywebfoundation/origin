import { Order } from './Order';

export class Trade {
    constructor(bid: Order, ask: Order, volume: number, price: number) {
        this.bidId = bid.id;
        this.askId = ask.id;
        this.volume = volume;
        this.price = price;
        this.created = new Date();
    }

    public readonly bidId: string;

    public readonly askId: string;

    public readonly created: Date;

    public readonly volume: number;

    public readonly price: number;
}
