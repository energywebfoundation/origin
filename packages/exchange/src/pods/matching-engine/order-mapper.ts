import { Ask, Bid, OrderSide } from '@energyweb/exchange-core';

import { Order } from '../order/order.entity';
import { ProductDTO } from '../order/product.dto';

export const toMatchingEngineOrder = (order: Order) => {
    return order.side === OrderSide.Ask
        ? new Ask(
              order.id,
              order.price,
              order.currentVolume,
              ProductDTO.toProduct(order.product),
              order.validFrom,
              order.userId,
              order.assetId
          )
        : new Bid(
              order.id,
              order.price,
              order.currentVolume,
              ProductDTO.toProduct(order.product),
              order.validFrom,
              order.userId
          );
};
