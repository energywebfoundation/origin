import { OrderSide } from '@energyweb/exchange-core';
import { ProductDTO } from './product.dto';

export class CreateOrderDto {
    readonly side: OrderSide;

    readonly volume: number;

    readonly price: number;

    readonly validFrom: Date;

    readonly product: ProductDTO;

    readonly userId: string;
}
