import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractsLookup } from './contracts-lookup.entity';
import { ContractsLookupController } from './contracts-lookup.controller';

@Module({
    imports: [TypeOrmModule.forFeature([ContractsLookup])],
    providers: [],
    controllers: [ContractsLookupController]
})
export class ContractsStorageModule {}
