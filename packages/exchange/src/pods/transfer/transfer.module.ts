import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountBalanceModule } from '../account-balance/account-balance.module';
import { AccountModule } from '../account/account.module';
import { AssetModule } from '../asset/asset.module';
import { WithdrawalProcessorModule } from '../withdrawal-processor/withdrawal-processor.module';
import { TransferController } from './transfer.controller';
import { Transfer } from './transfer.entity';
import { TransferService } from './transfer.service';

@Module({
    providers: [TransferService],
    imports: [
        TypeOrmModule.forFeature([Transfer], 'ExchangeConnection'),
        AssetModule,
        forwardRef(() => AccountModule),
        forwardRef(() => AccountBalanceModule),
        forwardRef(() => WithdrawalProcessorModule)
    ],
    exports: [TransferService],
    controllers: [TransferController]
})
export class TransferModule {}
