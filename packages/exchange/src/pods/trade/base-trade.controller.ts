import { ILoggedInUser } from '@energyweb/origin-backend-core';
import {
    UserDecorator,
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor
} from '@energyweb/origin-backend-utils';
import {
    Controller,
    Get,
    HttpStatus,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

import { TradeDTO } from './trade.dto';
import { TradeService } from './trade.service';

@ApiTags('trade')
@ApiBearerAuth('access-token')
@Controller('trade')
@UseInterceptors(NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export abstract class BaseTradeController<TProduct, TProductFilter> {
    constructor(private readonly tradeService: TradeService<TProduct, TProductFilter>) {}

    @UseGuards(AuthGuard(), ActiveUserGuard)
    @Get()
    @ApiResponse({ status: HttpStatus.OK, type: [TradeDTO], description: 'Get all trades' })
    public async getAll(@UserDecorator() user: ILoggedInUser): Promise<TradeDTO<TProduct>[]> {
        const trades = await this.tradeService.getAllByUser(user.ownerId, false);

        return trades.map((trade) =>
            TradeDTO.fromTrade(
                trade.withMaskedOrder(user.ownerId),
                trade.ask.assetId,
                trade.ask.product
            )
        );
    }
}
