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
    HttpException,
    HttpStatus,
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
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ForbiddenActionError } from '../../utils/exceptions';
import { ensureSingleProcessOnly } from '../../utils/ensureSingleProcessOnly';

import { CreateAskDTO } from './create-ask.dto';
import { CreateBidDTO } from './create-bid.dto';
import { DirectBuyDTO } from './direct-buy.dto';
import { AskBeingProcessedError } from './errors/ask-being-processed.error';
import { OrderService } from './order.service';
import { OrderDTO } from './order.dto';

@ApiTags('orders')
@ApiBearerAuth('access-token')
@Controller('orders')
@UseInterceptors(ClassSerializerInterceptor, NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export abstract class BaseOrderController<TProduct> {
    protected readonly logger = new Logger(BaseOrderController.name);

    constructor(private readonly orderService: OrderService<TProduct>) {}

    @Post('bid')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiBody({ type: CreateBidDTO })
    @ApiResponse({ status: HttpStatus.CREATED, type: OrderDTO, description: 'Create a bid' })
    public async createBid(
        @UserDecorator() user: ILoggedInUser,
        @Body() newOrder: CreateBidDTO<TProduct>
    ): Promise<OrderDTO<TProduct>> {
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
    @ApiBody({ type: CreateAskDTO })
    @ApiResponse({ status: HttpStatus.CREATED, type: OrderDTO, description: 'Create an ask' })
    public async createAsk(
        @UserDecorator() user: ILoggedInUser,
        @Body() newOrder: CreateAskDTO
    ): Promise<OrderDTO<TProduct>> {
        this.logger.log(`Creating new order ${JSON.stringify(newOrder)}`);

        try {
            const order = await ensureSingleProcessOnly(
                user.ownerId,
                'createAsk',
                () => this.orderService.createAsk(user.ownerId, newOrder),
                new AskBeingProcessedError()
            );
            return order;
        } catch (error) {
            this.logger.error(error.message);

            if (error instanceof AskBeingProcessedError) {
                throw new HttpException({ message: error.message }, 409);
            }

            throw new ForbiddenException();
        }
    }

    @Post('ask/buy')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiBody({ type: DirectBuyDTO })
    @ApiResponse({ status: HttpStatus.CREATED, type: OrderDTO, description: 'Direct buy' })
    public async directBuy(
        @UserDecorator() user: ILoggedInUser,
        @Body() directBuy: DirectBuyDTO
    ): Promise<OrderDTO<TProduct>> {
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
    @ApiResponse({ status: HttpStatus.OK, type: [OrderDTO], description: 'Get my orders' })
    public async getMyOrders(@UserDecorator() user: ILoggedInUser): Promise<OrderDTO<TProduct>[]> {
        const orders = await this.orderService.getAllOrders(user.ownerId);
        return orders;
    }

    @Get('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({ status: HttpStatus.OK, type: OrderDTO, description: 'Get order' })
    public async getOrder(
        @UserDecorator() user: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) orderId: string
    ): Promise<OrderDTO<TProduct>> {
        const order = await this.orderService.findOne(user.ownerId, orderId);
        return order;
    }

    @Post('/:id/cancel')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({ status: HttpStatus.ACCEPTED, type: OrderDTO, description: 'Cancel an order' })
    public async cancelOrder(
        @UserDecorator() user: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) orderId: string
    ): Promise<OrderDTO<TProduct>> {
        try {
            const order = await this.orderService.cancelOrder(user.ownerId, orderId);
            return order;
        } catch (error) {
            if (error instanceof ForbiddenActionError) {
                throw new ForbiddenException();
            }
            throw error;
        }
    }
}
