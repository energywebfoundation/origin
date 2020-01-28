import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Demand } from './demand.entity';
import { DemandService } from './demand.service';
import { OrderModule } from '../order/order.module';
import { DemandController } from './demand.controller';
import { MatchingEngineModule } from '../matching-engine/matching-engine.module';

@Module({
    providers: [DemandService],
    exports: [DemandService],
    imports: [TypeOrmModule.forFeature([Demand]), OrderModule, MatchingEngineModule],
    controllers: [DemandController]
})
export class DemandModule {}
