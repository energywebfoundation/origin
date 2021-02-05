import { ILoggedInUser } from '@energyweb/origin-backend-core';
import {
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor,
    UserDecorator
} from '@energyweb/origin-backend-utils';
import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ProductFilterDTO } from '../product/product-filter.dto';
import { OrderBookDTO } from './order-book.dto';
import { OrderBookService } from './order-book.service';

@ApiTags('orderbook')
@ApiBearerAuth('access-token')
@Controller('orderbook')
@UseInterceptors(NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export class OrderBookController {
    constructor(private readonly orderBookService: OrderBookService) {}

    @Post('/search')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBody({ type: ProductFilterDTO })
    @ApiResponse({ status: HttpStatus.OK, type: OrderBookDTO, description: 'Gets the order book' })
    public getByProduct(
        @UserDecorator() user: ILoggedInUser,
        @Body() productFilter: ProductFilterDTO
    ): OrderBookDTO {
        return this.orderBookService.getByProduct(productFilter, user.ownerId);
    }

    @Post('/public/search')
    @HttpCode(HttpStatus.OK)
    @ApiBody({ type: ProductFilterDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: OrderBookDTO,
        description: 'Gets the public order book'
    })
    public getByProductPublic(@Body() productFilter: ProductFilterDTO): OrderBookDTO {
        return this.orderBookService.getByProduct(productFilter);
    }
}
