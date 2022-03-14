import { AccountBalanceModule, TransferModule as BaseTransferModule } from '@energyweb/exchange';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IrecModule } from '@energyweb/origin-organization-irec-api';
import { IrecTransferController } from './transfer.controller';
import { UserModule } from '@energyweb/origin-backend';
import { IrecRequestClaimHandler, GetIrecTradeTransfersHandler } from './handler';
import { IrecTradeTransfer } from './irec-trade-transfer.entity';

@Module({
    imports: [
        BaseTransferModule,
        CqrsModule,
        IrecModule,
        AccountBalanceModule,
        UserModule,
        TypeOrmModule.forFeature([IrecTradeTransfer])
    ],
    controllers: [IrecTransferController],
    providers: [IrecRequestClaimHandler, GetIrecTradeTransfersHandler]
})
export class IrecTransferModule {}
