import { Product, Bid, Ask } from '@energyweb/exchange-core';

export class OrderBookOrderDTO {
    price: number;

    volume: string;

    product: Product;

    userId: string;

    assetId?: string;

    public static fromOrder(order: Bid | Ask, userId?: string): OrderBookOrderDTO {
        return {
            ...order,
            volume: order.volume.toString(10),
            userId: order.userId === userId ? order.userId : undefined
        };
    }
}
