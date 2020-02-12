import { Controller, Logger, Post, Body, ForbiddenException } from '@nestjs/common';

import { OrderService } from './order.service';
import { CreateBidDTO } from './create-bid.dto';
import { CreateAskDTO } from './create-ask.dto';

@Controller('order')
export class OrderController {
    private readonly logger = new Logger(OrderController.name);

    constructor(private readonly orderService: OrderService) {}

    @Post('bid')
    public async createBid(@Body() newOrder: CreateBidDTO) {
        this.logger.log(`Creating new order ${JSON.stringify(newOrder)}`);

        try {
            const order = await this.orderService.createBid({ ...newOrder, userId: '1' });

            this.orderService.submit(order);

            return order;
        } catch (error) {
            this.logger.error(error);

            throw new ForbiddenException();
        }
    }

    @Post('ask')
    public async createAsk(@Body() newOrder: CreateAskDTO) {
        this.logger.log(`Creating new order ${JSON.stringify(newOrder)}`);

        try {
            const order = await this.orderService.createAsk({ ...newOrder, userId: '1' });

            this.orderService.submit(order);

            return order;
        } catch (error) {
            this.logger.error(error);

            throw new ForbiddenException();
        }
    }
}
