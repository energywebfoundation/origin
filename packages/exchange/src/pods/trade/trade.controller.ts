import { Controller, Get, Logger, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IUser } from '@energyweb/origin-backend-core';

import { TradeService } from './trade.service';
import { UserDecorator } from '../decorators/user.decorator';

@Controller('trade')
export class TradeController {
    private readonly logger = new Logger(TradeController.name);

    constructor(private readonly tradeService: TradeService) {}

    @UseGuards(AuthGuard())
    @Get()
    public getAll(@UserDecorator() user: IUser) {
        return this.tradeService.getAll(user.id.toString());
    }
}
