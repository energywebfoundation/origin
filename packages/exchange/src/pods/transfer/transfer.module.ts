import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Transfer } from './transfer.entity';
import { TransferService } from './transfer.service';
import { AssetModule } from '../asset/asset.module';
import { AccountModule } from '../account/account.module';
import { TransferController } from './transfer.controller';

@Module({
    providers: [TransferService],
    imports: [TypeOrmModule.forFeature([Transfer]), AssetModule, forwardRef(() => AccountModule)],
    exports: [TransferService],
    controllers: [TransferController]
})
export class TransferModule {}
