import { AccountBalanceModule, TransferModule as BaseTransferModule } from '@energyweb/exchange';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IrecModule } from '@energyweb/origin-organization-irec-api';
import { IrecTransferController } from './transfer.controller';
import { UserModule } from '@energyweb/origin-backend';
import { IrecRequestClaimHandler } from './handler';

@Module({
    imports: [
        BaseTransferModule,
        CqrsModule,
        IrecModule,
        AccountBalanceModule,
        UserModule
    ],
    controllers: [IrecTransferController],
    providers: [IrecRequestClaimHandler]
})
export class IrecTransferModule {}
