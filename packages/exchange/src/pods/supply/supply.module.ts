import { Module } from '@nestjs/common';
import { SupplyService } from './supply.service';
import { SupplyController } from './supply.controller';

@Module({
  providers: [SupplyService],
  controllers: [SupplyController]
})
export class SupplyModule {}
