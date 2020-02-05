import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Deposit } from './deposit.entity';
import { DepositService } from './deposit.service';

@Module({
    providers: [DepositService],
    imports: [TypeOrmModule.forFeature([Deposit])],
    exports: [DepositService]
})
export class DepositModule {}
