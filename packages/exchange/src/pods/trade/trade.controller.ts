import { Controller, Get, Logger } from '@nestjs/common';
import { TradeService } from './trade.service';

@Controller('trade')
export class TradeController {
    private readonly logger = new Logger(TradeController.name);

    constructor(private readonly tradeService: TradeService) {}

    @Get()
    public getAll() {
        return this.tradeService.findAll('1');
    }
}
