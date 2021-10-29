import {
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

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller('admin')
@UseInterceptors(NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export class BaseAdminTradeController<TProduct, TProductFilter> {
    constructor(private readonly tradeService: TradeService<TProduct, TProductFilter>) {}

    @UseGuards(AuthGuard(), ActiveUserGuard)
    @Get('trades')
    @ApiResponse({ status: HttpStatus.OK, type: [TradeDTO], description: 'Get all trades for Admin' })
    public async getAll(): Promise<TradeDTO<TProduct>[]> {
        const trades = await this.tradeService.getAll();

        return trades.map((trade) =>
            TradeDTO.fromTrade(
                trade,
                trade.ask.assetId,
                trade.ask.product
            )
        );
    }
}
