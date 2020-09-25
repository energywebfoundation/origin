import { ILoggedInUser } from '@energyweb/origin-backend-core';
import {
    UserDecorator,
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor
} from '@energyweb/origin-backend-utils';
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
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CreateAskDTO } from './create-ask.dto';
import { CreateBidDTO } from './create-bid.dto';
import { DirectBuyDTO } from './direct-buy.dto';
import { Order } from './order.entity';
import { OrderService } from './order.service';

@Controller('orders')
@UseInterceptors(ClassSerializerInterceptor, NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export class OrderController {
    private readonly logger = new Logger(OrderController.name);

    constructor(private readonly orderService: OrderService) {}

    @Post('bid')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    public async createBid(
        @UserDecorator() user: ILoggedInUser,
        @Body() newOrder: CreateBidDTO
    ): Promise<Order> {
        this.logger.log(`Creating new order ${JSON.stringify(newOrder)}`);

        try {
            const order = await this.orderService.createBid(user.ownerId, newOrder);
            return order;
        } catch (error) {
            this.logger.error(error.message);

            throw new ForbiddenException();
        }
    }

    @Post('ask')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    public async createAsk(
        @UserDecorator() user: ILoggedInUser,
        @Body() newOrder: CreateAskDTO
    ): Promise<Order> {
        this.logger.log(`Creating new order ${JSON.stringify(newOrder)}`);

        try {
            const order = await this.orderService.createAsk(user.ownerId, newOrder);
            return order;
        } catch (error) {
            this.logger.error(error.message);

            throw new ForbiddenException();
        }
    }

    @Post('ask/buy')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    public async directBuy(
        @UserDecorator() user: ILoggedInUser,
        @Body() directBuy: DirectBuyDTO
    ): Promise<Order> {
        this.logger.log(`Creating new direct order ${JSON.stringify(directBuy)}`);

        try {
            const order = await this.orderService.createDirectBuy(user.ownerId, directBuy);
            return order;
        } catch (error) {
            this.logger.error(error.message);

            throw new ForbiddenException();
        }
    }

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    public async getOrders(@UserDecorator() user: ILoggedInUser): Promise<Order[]> {
        const orders = await this.orderService.getAllOrders(user.ownerId);
        return orders;
    }

    @Get('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    public async getOrder(
        @UserDecorator() user: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) orderId: string
    ) {
        const order = await this.orderService.findOne(user.ownerId, orderId);
        return order;
    }

    @Post('/:id/cancel')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @HttpCode(202)
    public async cancelOrder(
        @UserDecorator() user: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) orderId: string
    ) {
        const order = await this.orderService.cancelOrder(user.ownerId, orderId);
        return order;
    }
}
