import { Module } from '@nestjs/common';
import { OrderBookService } from './order-book.service';
import { OrderBookController } from './order-book.controller';
import { MatchingEngineModule } from '../matching-engine/matching-engine.module';

@Module({
    providers: [OrderBookService],
    imports: [MatchingEngineModule],
    controllers: [OrderBookController]
})
export class OrderBookModule {}
