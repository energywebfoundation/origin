import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Supply } from './supply.entity';
import { SupplyController } from './supply.controller';
import { SupplyService } from './supply.service';

@Module({
    controllers: [SupplyController],
    providers: [SupplyService],
    exports: [SupplyService],
    imports: [TypeOrmModule.forFeature([Supply])]
})
export class SupplyModule {}
