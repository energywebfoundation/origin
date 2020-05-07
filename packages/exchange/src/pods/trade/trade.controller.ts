import { ILoggedInUser, UserDecorator } from '@energyweb/origin-backend-core';
import { Controller, Get, Logger, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TradeDTO } from './trade.dto';
import { TradeService } from './trade.service';

@Controller('trade')
export class TradeController {
    private readonly logger = new Logger(TradeController.name);

    constructor(private readonly tradeService: TradeService) {}

    @UseGuards(AuthGuard())
    @Get()
    public async getAll(@UserDecorator() user: ILoggedInUser): Promise<TradeDTO[]> {
        const userId = user.id.toString();
        const trades = await this.tradeService.getAll(userId, false);

        return trades.map((trade) =>
            TradeDTO.fromTrade(trade.withMaskedOrder(userId), trade.ask.assetId, trade.ask.product)
        );
    }
}
