import { BaseOrderController, CreateAskDTO, DirectBuyDTO } from '@energyweb/exchange';
import { ILoggedInUser } from '@energyweb/origin-backend-core';
import {
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor,
    UserDecorator
} from '@energyweb/origin-backend-utils';
import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
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

import { ProductDTO } from '../product/product.dto';
import { CreateBidDTO } from './create-bid.dto';
import { OrderDTO } from './order.dto';

@ApiTags('orders')
@ApiBearerAuth('access-token')
@Controller('orders')
@UseInterceptors(ClassSerializerInterceptor, NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export class OrderController extends BaseOrderController<ProductDTO> {
    @Post('bid')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiBody({ type: CreateBidDTO })
    @ApiResponse({ status: HttpStatus.CREATED, type: OrderDTO, description: 'Create a bid' })
    public async createBid(
        @UserDecorator() user: ILoggedInUser,
        @Body() newOrder: CreateBidDTO
    ): Promise<OrderDTO> {
        return super.createBid(user, newOrder);
    }

    @Post('ask')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiBody({ type: CreateAskDTO })
    @ApiResponse({ status: HttpStatus.CREATED, type: OrderDTO, description: 'Create an ask' })
    public async createAsk(
        @UserDecorator() user: ILoggedInUser,
        @Body() newOrder: CreateAskDTO
    ): Promise<OrderDTO> {
        return super.createAsk(user, newOrder);
    }

    @Post('ask/buy')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiBody({ type: DirectBuyDTO })
    @ApiResponse({ status: HttpStatus.CREATED, type: OrderDTO, description: 'Direct buy' })
    public async directBuy(
        @UserDecorator() user: ILoggedInUser,
        @Body() directBuy: DirectBuyDTO
    ): Promise<OrderDTO> {
        return super.directBuy(user, directBuy);
    }

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({ status: HttpStatus.OK, type: [OrderDTO], description: 'Get my orders' })
    public async getMyOrders(@UserDecorator() user: ILoggedInUser): Promise<OrderDTO[]> {
        return super.getMyOrders(user);
    }

    @Get('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({ status: HttpStatus.OK, type: OrderDTO, description: 'Get order' })
    public async getOrder(
        @UserDecorator() user: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) orderId: string
    ): Promise<OrderDTO> {
        return super.getOrder(user, orderId);
    }

    @Post('/:id/cancel')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({ status: HttpStatus.ACCEPTED, type: OrderDTO, description: 'Cancel an order' })
    public async cancelOrder(
        @UserDecorator() user: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) orderId: string
    ): Promise<OrderDTO> {
        return super.cancelOrder(user, orderId);
    }
}
