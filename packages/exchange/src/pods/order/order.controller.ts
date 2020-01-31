import { Controller, Logger, Post, Body } from '@nestjs/common';

import { OrderService } from './order.service';
import { CreateOrderDto } from './create-order.dto';

@Controller('order')
export class OrderController {
    private readonly logger = new Logger(OrderController.name);

    constructor(private readonly orderService: OrderService) {}

    @Post()
    public async create(@Body() newOrder: CreateOrderDto) {
        this.logger.log(`Creating new order ${JSON.stringify(newOrder)}`);

        // TODO: userId from JWT token
        const order = await this.orderService.create({ ...newOrder, userId: '1' });

        this.orderService.submit(order);

        return order.id;
    }
}
