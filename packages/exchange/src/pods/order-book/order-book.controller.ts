import { IUser } from '@energyweb/origin-backend-core';
import { Body, Controller, Post, UseGuards, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserDecorator } from '../decorators/user.decorator';
import { OrderBookOrderDTO } from './order-book-order.dto';
import { OrderBookService } from './order-book.service';
import { ProductFilterDTO } from './product-filter.dto';

@Controller('orderbook')
export class OrderBookController {
    constructor(private readonly orderBookService: OrderBookService) {}

    @Post('/search')
    @UseGuards(AuthGuard())
    @HttpCode(200)
    public getByProduct(@UserDecorator() user: IUser, @Body() productFilter: ProductFilterDTO) {
        const { asks, bids } = this.orderBookService.getByProduct(
            ProductFilterDTO.toProductFilter(productFilter)
        );
        const userId = user?.id.toString();

        return {
            asks: asks.map(ask => OrderBookOrderDTO.fromOrder(ask, userId)).toArray(),
            bids: bids.map(bid => OrderBookOrderDTO.fromOrder(bid, userId)).toArray()
        };
    }
}
