import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Trade } from './trade.entity';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { MessageModule } from '../message/message.module';

@Module({
    providers: [TradeService],
    exports: [TradeService],
    imports: [TypeOrmModule.forFeature([Trade]), MessageModule],
    controllers: [TradeController]
})
export class TradeModule {}
