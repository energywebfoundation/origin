import { IUser } from '@energyweb/origin-backend-core';
import { Body, Controller, ForbiddenException, Logger, Post, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserDecorator } from '../decorators/user.decorator';
import { CreateAskDTO } from './create-ask.dto';
import { CreateBidDTO } from './create-bid.dto';
import { OrderService } from './order.service';
import { OrderDTO } from './order.dto';
import { DirectBuyDTO } from './direct-buy.dto';

@Controller('orders')
export class OrderController {
    private readonly logger = new Logger(OrderController.name);

    constructor(private readonly orderService: OrderService) {}

    @Post('bid')
    @UseGuards(AuthGuard())
    public async createBid(
        @UserDecorator() user: IUser,
        @Body() newOrder: CreateBidDTO
    ): Promise<OrderDTO> {
        this.logger.log(`Creating new order ${JSON.stringify(newOrder)}`);

        try {
            const order = await this.orderService.createBid(user.id.toString(), newOrder);
            return OrderDTO.fromOrder(order);
        } catch (error) {
            this.logger.error(error.message);

            throw new ForbiddenException();
        }
    }

    @Post('ask')
    @UseGuards(AuthGuard())
    public async createAsk(
        @UserDecorator() user: IUser,
        @Body() newOrder: CreateAskDTO
    ): Promise<OrderDTO> {
        this.logger.log(`Creating new order ${JSON.stringify(newOrder)}`);

        try {
            const order = await this.orderService.createAsk(user.id.toString(), newOrder);
            return OrderDTO.fromOrder(order);
        } catch (error) {
            this.logger.error(error.message);

            throw new ForbiddenException();
        }
    }

    @Post('ask/buy')
    @UseGuards(AuthGuard())
    public async directBuy(
        @UserDecorator() user: IUser,
        @Body() directBuy: DirectBuyDTO
    ): Promise<OrderDTO> {
        this.logger.log(`Creating new direct order ${JSON.stringify(directBuy)}`);

        try {
            const order = await this.orderService.createDirectBuy(user.id.toString(), directBuy);
            return OrderDTO.fromOrder(order);
        } catch (error) {
            this.logger.error(error.message);

            throw new ForbiddenException();
        }
    }

    @Get()
    @UseGuards(AuthGuard())
    public async getOrders(@UserDecorator() user: IUser): Promise<OrderDTO[]> {
        const orders = await this.orderService.getAllOrders(user.id.toString());

        return orders.map(order => OrderDTO.fromOrder(order));
    }
}
