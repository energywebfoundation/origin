import { IUser } from '@energyweb/origin-backend-core';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
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
    public getByProduct(@UserDecorator() user: IUser, @Body() productFilter: ProductFilterDTO) {
        return this.filterOrderBook(productFilter, user.id.toString());
    }

    @Post('/public/search')
    public getByProductPublic(@Body() productFilter: ProductFilterDTO) {
        return this.filterOrderBook(productFilter);
    }

    private filterOrderBook(productFilter: ProductFilterDTO, userId?: string) {
        const { asks, bids } = this.orderBookService.getByProduct(
            ProductFilterDTO.toProductFilter(productFilter)
        );

        return {
            asks: asks.map(ask => OrderBookOrderDTO.fromOrder(ask, userId)).toArray(),
            bids: bids.map(bid => OrderBookOrderDTO.fromOrder(bid, userId)).toArray()
        };
    }
}
