import { ILoggedInUser } from '@energyweb/origin-backend-core';
import {
    UserDecorator,
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor
} from '@energyweb/origin-backend-utils';
import {
    Controller,
    Get,
    Logger,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TradeDTO } from './trade.dto';
import { TradeService } from './trade.service';

@Controller('trade')
@UseInterceptors(NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export class TradeController {
    private readonly logger = new Logger(TradeController.name);

    constructor(private readonly tradeService: TradeService) {}

    @UseGuards(AuthGuard(), ActiveUserGuard)
    @Get()
    public async getAll(@UserDecorator() user: ILoggedInUser): Promise<TradeDTO[]> {
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
