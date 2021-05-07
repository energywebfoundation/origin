import {
  OrderSide,
  OrderStatus,
} from '@energyweb/exchange-irec-react-query-client';
import { Order } from '../types';

export class ActiveOrders extends Array<Order> {
  orders: Order[];

  constructor(orders: Order[]) {
    super();
    this.orders = orders
      ? orders.filter(
          (o) =>
            o.status === OrderStatus.Active ||
            o.status === OrderStatus.PartiallyFilled
        )
      : [];
  }

  public get bids() {
    return this.orders.filter(
      (o) => o.side === OrderSide.Bid && o.demandId === null
    );
  }

  public get asks() {
    return this.orders.filter((o) => o.side === OrderSide.Ask);
  }
}
