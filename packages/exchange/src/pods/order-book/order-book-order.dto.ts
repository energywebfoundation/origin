import { Product } from '@energyweb/exchange-core';

export class OrderBookOrderDTO {
    price: number;

    volume: string;

    product: Product;
}
