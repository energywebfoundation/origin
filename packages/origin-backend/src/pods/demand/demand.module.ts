import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Demand } from './demand.entity';
import { DemandController } from './demand.controller';
import { EventsModule } from '../../events/events.module';

@Module({
    imports: [TypeOrmModule.forFeature([Demand]), EventsModule],
    providers: [],
    controllers: [DemandController]
})
export class DemandModule {}
