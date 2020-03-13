import { IUser } from '@energyweb/origin-backend-core';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserDecorator } from '../decorators/user.decorator';
import { ProductDTO } from '../order/product.dto';
import { OrderBookOrderDTO } from './order-book-order.dto';
import { OrderBookService } from './order-book.service';

@Controller('orderbook')
export class OrderBookController {
    constructor(private readonly orderBookService: OrderBookService) {}

    @Post('/search')
    @UseGuards(AuthGuard())
    public getByProduct(@UserDecorator() user: IUser, @Body() product: ProductDTO) {
        const { asks, bids } = this.orderBookService.getByProduct(ProductDTO.toProduct(product));
        const userId = user?.id.toString();

        return {
            asks: asks.map(ask => OrderBookOrderDTO.fromOrder(ask, userId)).toArray(),
            bids: bids.map(bid => OrderBookOrderDTO.fromOrder(bid, userId)).toArray()
        };
    }
}
