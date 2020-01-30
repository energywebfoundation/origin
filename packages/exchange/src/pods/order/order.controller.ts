import { IUser } from '@energyweb/origin-backend-core';
import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserDecorator } from '../decorators/user.decorator';
import { CreateOrderDto } from './create-order.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
    private readonly logger = new Logger(OrderController.name);

    constructor(private readonly orderService: OrderService) {}

    @Post()
    @UseGuards(AuthGuard())
    public async create(@UserDecorator() user: IUser, @Body() newOrder: CreateOrderDto) {
        this.logger.log(`Creating new order ${JSON.stringify(newOrder)}`);

        const order = await this.orderService.create({ ...newOrder, userId: user.id.toString() });

        this.orderService.submit(order);

        return order.id;
    }
}
