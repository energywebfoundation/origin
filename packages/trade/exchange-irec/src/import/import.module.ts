import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';

import { IrecModule } from '@energyweb/origin-organization-irec-api';
import {
    CertificateModule,
    CertificationRequestModule,
    BlockchainProperties,
    IrecCertificationRequest
} from '@energyweb/issuer-irec-api';
import { DeviceModule } from '@energyweb/origin-device-registry-irec-local-api';
import { DeviceRegistryModule } from '@energyweb/origin-device-registry-api';
import { UserModule } from '@energyweb/origin-backend';

import { GetIrecCertificatesToImportHandler, ImportIrecCertificateHandler } from './handler';
import { ImportController } from './import.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportModule } from '../export';

@Module({
    imports: [
        TypeOrmModule.forFeature([IrecCertificationRequest]),
        CqrsModule,
        IrecModule,
        DeviceRegistryModule,
        DeviceModule,
        UserModule,
        BlockchainProperties,
        CertificationRequestModule,
        CertificateModule,
        ConfigModule,
        ExportModule
    ],
    controllers: [ImportController],
    providers: [GetIrecCertificatesToImportHandler, ImportIrecCertificateHandler],
    exports: [GetIrecCertificatesToImportHandler, ImportIrecCertificateHandler]
})
export class ImportModule {}
