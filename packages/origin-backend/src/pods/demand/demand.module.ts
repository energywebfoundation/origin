import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Demand } from './demand.entity';
import { DemandController } from './demand.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Demand])],
    providers: [],
    controllers: [DemandController]
})
export class DemandModule {}
