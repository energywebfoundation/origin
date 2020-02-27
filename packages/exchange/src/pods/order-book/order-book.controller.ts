import { DeviceVintage, Product, OrderBookOrderDTO } from '@energyweb/exchange-core';
import { IUser } from '@energyweb/origin-backend-core';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserDecorator } from '../decorators/user.decorator';
import { OrderBookService } from './order-book.service';

@Controller('orderbook')
export class OrderBookController {
    constructor(private readonly orderBookService: OrderBookService) {}

    @Get()
    @UseGuards(AuthGuard())
    public getByProduct(
        @UserDecorator() user: IUser,
        @Query('deviceType') deviceType: string,
        @Query('location') location: string,
        @Query('vintage') vintage: number
    ) {
        let product: Product = deviceType ? { deviceType: [deviceType] } : {};

        if (location) {
            product = { ...product, location: [location] };
        }
        if (vintage) {
            product = { ...product, deviceVintage: new DeviceVintage(vintage) };
        }

        const { asks, bids } = this.orderBookService.getByProduct(product);
        const userId = user?.id.toString();

        return {
            asks: asks.map(ask => OrderBookOrderDTO.fromOrder(ask, userId)).toArray(),
            bids: bids.map(bid => OrderBookOrderDTO.fromOrder(bid, userId)).toArray()
        };
    }
}
