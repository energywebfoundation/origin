import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketContractLookup } from './market-contract-lookup.entity';
import { MarketContractLookupController } from './market-contract-lookup.controller';

@Module({
    imports: [TypeOrmModule.forFeature([MarketContractLookup])],
    providers: [],
    controllers: [MarketContractLookupController]
})
export class ContractsStorageModule {}
