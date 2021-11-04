import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AccountBalanceModule, AssetModule } from '@energyweb/exchange';
import { IrecModule } from '@energyweb/origin-organization-irec-api';
import { CertificationRequestModule } from '@energyweb/issuer-irec-api';

import { ExportController } from './export.controller';
import { ExportedAsset } from './exported.entity';
import { ExportAccountingService } from './export-accounting.service';
import { ExportAssetHandler } from './handler/export-asset.handler';

@Module({
    imports: [
        AccountBalanceModule,
        AssetModule,
        CertificationRequestModule,
        ConfigModule,
        CqrsModule,
        IrecModule,
        TypeOrmModule.forFeature([ExportedAsset])
    ],
    controllers: [ExportController],
    providers: [ExportAssetHandler, ExportAccountingService],
    exports: [ExportAssetHandler, ExportAccountingService]
})
export class ExportModule {}
