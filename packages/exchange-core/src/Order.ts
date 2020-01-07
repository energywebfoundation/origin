import { Product } from './Product';

export enum OrderSide {
    Bid,
    Ask
}

export enum OrderStatus {
    Active,
    Cancelled,
    Filled,
    PartiallyFilled
}

export class Order {
    public id: string;

    public side: OrderSide;

    public status: OrderStatus;

    public validFrom: number;

    public product: Product;

    public price: number;

    public volume: number;
}
