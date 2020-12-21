import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from '../order';

import { DemandTimePeriodService } from './demand-time-period.service';
import { Demand } from './demand.entity';
import { DemandService } from './demand.service';

@Module({
    providers: [DemandService, DemandTimePeriodService],
    exports: [DemandService],
    imports: [TypeOrmModule.forFeature([Demand]), OrderModule, CqrsModule]
})
export class DemandModule {}
