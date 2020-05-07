import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { UserDecorator } from '@energyweb/origin-backend-utils';
import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    ForbiddenException,
    Get,
    HttpCode,
    Logger,
    Param,
    ParseUUIDPipe,
    Post,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CreateAskDTO } from './create-ask.dto';
import { CreateBidDTO } from './create-bid.dto';
import { DirectBuyDTO } from './direct-buy.dto';
import { Order } from './order.entity';
import { OrderService } from './order.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('orders')
export class OrderController {
    private readonly logger = new Logger(OrderController.name);

    constructor(private readonly orderService: OrderService) {}

    @Post('bid')
    @UseGuards(AuthGuard())
    public async createBid(
        @UserDecorator() user: ILoggedInUser,
        @Body() newOrder: CreateBidDTO
    ): Promise<Order> {
        this.logger.log(`Creating new order ${JSON.stringify(newOrder)}`);

        try {
            const order = await this.orderService.createBid(user.id.toString(), newOrder);
            return order;
        } catch (error) {
            this.logger.error(error.message);

            throw new ForbiddenException();
        }
    }

    @Post('ask')
    @UseGuards(AuthGuard())
    public async createAsk(
        @UserDecorator() user: ILoggedInUser,
        @Body() newOrder: CreateAskDTO
    ): Promise<Order> {
        this.logger.log(`Creating new order ${JSON.stringify(newOrder)}`);

        try {
            const order = await this.orderService.createAsk(user.id.toString(), newOrder);
            return order;
        } catch (error) {
            this.logger.error(error.message);

            throw new ForbiddenException();
        }
    }

    @Post('ask/buy')
    @UseGuards(AuthGuard())
    public async directBuy(
        @UserDecorator() user: ILoggedInUser,
        @Body() directBuy: DirectBuyDTO
    ): Promise<Order> {
        this.logger.log(`Creating new direct order ${JSON.stringify(directBuy)}`);

        try {
            const order = await this.orderService.createDirectBuy(user.id.toString(), directBuy);
            return order;
        } catch (error) {
            this.logger.error(error.message);

            throw new ForbiddenException();
        }
    }

    @Get()
    @UseGuards(AuthGuard())
    public async getOrders(@UserDecorator() user: ILoggedInUser): Promise<Order[]> {
        const orders = await this.orderService.getAllOrders(user.id.toString());
        return orders;
    }

    @Get('/:id')
    @UseGuards(AuthGuard())
    public async getOrder(
        @UserDecorator() user: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) orderId: string
    ) {
        const order = await this.orderService.findOne(user.id.toString(), orderId);
        return order;
    }

    @Post('/:id/cancel')
    @UseGuards(AuthGuard())
    @HttpCode(202)
    public async cancelOrder(
        @UserDecorator() user: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) orderId: string
    ) {
        const order = await this.orderService.cancelOrder(user.id.toString(), orderId);
        return order;
    }
}
