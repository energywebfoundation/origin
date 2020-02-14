import { IUser } from '@energyweb/origin-backend-core';
import { Body, Controller, ForbiddenException, Logger, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserDecorator } from '../decorators/user.decorator';
import { CreateAskDTO } from './create-ask.dto';
import { CreateBidDTO } from './create-bid.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
    private readonly logger = new Logger(OrderController.name);

    constructor(private readonly orderService: OrderService) {}

    @Post('bid')
    @UseGuards(AuthGuard())
    public async createBid(@UserDecorator() user: IUser, @Body() newOrder: CreateBidDTO) {
        this.logger.log(`Creating new order ${JSON.stringify(newOrder)}`);

        try {
            const order = await this.orderService.createBid({
                ...newOrder,
                userId: user.id.toString()
            });

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
