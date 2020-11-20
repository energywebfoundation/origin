import { ILoggedInUser } from '@energyweb/origin-backend-core';
import {
    UserDecorator,
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor
} from '@energyweb/origin-backend-utils';
import {
    Body,
    Controller,
    Post,
    UseGuards,
    HttpCode,
    UseInterceptors,
    ValidationPipe,
    UsePipes,
    HttpStatus
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { OrderBookOrderDTO } from './order-book-order.dto';
import { OrderBookService } from './order-book.service';
import { ProductFilterDTO } from './product-filter.dto';
import { TradeService } from '../trade/trade.service';
import { OrderBookDTO } from './order-book.dto';

@ApiTags('orderbook')
@Controller('orderbook')
@UseInterceptors(NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export class OrderBookController {
    constructor(
        private readonly orderBookService: OrderBookService,
        private readonly tradeService: TradeService
    ) {}

    @Post('/search')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: HttpStatus.OK, type: OrderBookDTO, description: 'Gets the order book' })
    public getByProduct(
        @UserDecorator() user: ILoggedInUser,
        @Body() productFilter: ProductFilterDTO
    ): OrderBookDTO {
        return this.filterOrderBook(productFilter, user.ownerId);
    }

    @Post('/public/search')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        type: OrderBookDTO,
        description: 'Gets the public order book'
    })
    public getByProductPublic(@Body() productFilter: ProductFilterDTO): OrderBookDTO {
        return this.filterOrderBook(productFilter);
    }

    private filterOrderBook(productFilterDTO: ProductFilterDTO, userId?: string): OrderBookDTO {
        const productFilter = ProductFilterDTO.toProductFilter(productFilterDTO);
        const { asks, bids } = this.orderBookService.getByProduct(productFilter);
        const lastTradedPrice = this.tradeService.getLastTradedPrice(productFilter);

        return {
            asks: asks.map((ask) => OrderBookOrderDTO.fromOrder(ask, userId)).toArray(),
            bids: bids.map((bid) => OrderBookOrderDTO.fromOrder(bid, userId)).toArray(),
            lastTradedPrice
        };
    }
}
