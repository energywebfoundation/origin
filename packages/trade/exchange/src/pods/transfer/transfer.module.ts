import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountModule } from '../account/account.module';
import { AssetModule } from '../asset/asset.module';
import { DepositDiscoveredEventHandler } from './handlers';
import { TransferController } from './transfer.controller';
import { Transfer } from './transfer.entity';
import { TransferService } from './transfer.service';

@Module({
    providers: [TransferService, DepositDiscoveredEventHandler],
    imports: [TypeOrmModule.forFeature([Transfer]), AssetModule, CqrsModule, AccountModule],
    exports: [TransferService],
    controllers: [TransferController]
})
export class TransferModule {}
