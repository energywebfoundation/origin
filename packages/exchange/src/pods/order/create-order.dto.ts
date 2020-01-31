import { OrderSide, Product } from '@energyweb/exchange-core';

export class CreateOrderDto {
    readonly side: OrderSide;

    readonly volume: number;

    readonly price: number;

    readonly validFrom: Date;

    readonly product: Product;

    readonly userId: string;
}
