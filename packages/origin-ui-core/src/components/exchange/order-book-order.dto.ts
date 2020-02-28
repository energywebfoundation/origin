import { Product } from '@energyweb/exchange-core';

export interface IOrderBookOrderDTO {
    price: number;

    volume: string;

    product: Product;

    userId: string;
}
