import { Order } from './Order';

export class Trade {
    constructor(bid: Order, ask: Order, volume: number, price: number) {
        this.bidId = bid.id;
        this.askId = ask.id;
        this.volume = volume;
        this.price = price;
        this.timestamp = new Date().getTime();
    }

    public readonly bidId: string;

    public readonly askId: string;

    public readonly timestamp: number;

    public readonly volume: number;

    public readonly price: number;
}
