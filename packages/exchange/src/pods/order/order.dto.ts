import { OrderStatus, OrderSide } from '@energyweb/exchange-core';
import { ProductDTO } from './product.dto';
import { Asset } from '../asset/asset.entity';
import { Order } from './order.entity';
import { OrderType } from './order-type.enum';

export class OrderDTO {
    id: string;

    userId: string;

    status: OrderStatus;

    startVolume: string;

    currentVolume: string;

    side: OrderSide;

    price: number;

    validFrom: string;

    product: ProductDTO;

    asset: Asset;

    demandId: string;

    type: OrderType;

    directBuyId: string;

    public static fromOrder(order: Order): OrderDTO {
        return {
            ...order,
            startVolume: order.startVolume.toString(10),
            currentVolume: order.currentVolume.toString(10),
            validFrom: order.validFrom.toISOString(),
            demandId: order.demandId
        };
    }
}
