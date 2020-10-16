import { Order } from './exchange';
import { OrderSide, OrderStatus } from '@energyweb/exchange-core';

export class ActiveOrders extends Array<Order> {
    orders: Order[];

    constructor(orders: Order[]) {
        super();
        this.orders = orders.filter(
            (o) => o.status === OrderStatus.Active || o.status === OrderStatus.PartiallyFilled
        );
    }

    public get bids() {
        return this.orders.filter(
            (o) => o.side === OrderSide.Bid && !{}.hasOwnProperty.call(o, 'demandId')
        );
    }

    public get asks() {
        return this.orders.filter((o) => o.side === OrderSide.Ask);
    }
}
