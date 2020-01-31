import { Product, DeviceVintage } from '@energyweb/exchange-core';
import { Controller, Get, Query } from '@nestjs/common';

import { OrderBookService } from './order-book.service';

@Controller('orderbook')
export class OrderBookController {
    constructor(private readonly orderBookService: OrderBookService) {}

    @Get()
    public getByProduct(
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

        return this.orderBookService.getByProduct(product);
    }
}
