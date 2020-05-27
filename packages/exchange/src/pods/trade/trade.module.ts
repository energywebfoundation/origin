import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Trade } from './trade.entity';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { RunnerModule } from '../runner/runner.module';

@Module({
    providers: [TradeService],
    exports: [TradeService],
    imports: [TypeOrmModule.forFeature([Trade]), RunnerModule],
    controllers: [TradeController]
})
export class TradeModule {}
