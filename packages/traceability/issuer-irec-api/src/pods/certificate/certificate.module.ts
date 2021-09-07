import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import {
    BlockchainPropertiesModule,
    Certificate,
    CertificateBatchController,
    OnChainCertificateWatcher
} from '@energyweb/issuer-api';
import { IrecModule } from '@energyweb/origin-organization-irec-api';
import { DeviceModule } from '@energyweb/origin-device-registry-irec-local-api';
import { DeviceRegistryModule } from '@energyweb/origin-device-registry-api';
import { UserModule } from '@energyweb/origin-backend';

import { CertificationRequestModule, IrecCertificationRequest } from '../certification-request';
import { IrecCertificateController } from './certificate.controller';
import { CertificateHandlers } from './handler';

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([Certificate, IrecCertificationRequest]),
        BlockchainPropertiesModule,
        IrecModule,
        DeviceRegistryModule,
        DeviceModule,
        UserModule,
        forwardRef(() => CertificationRequestModule)
    ],
    controllers: [IrecCertificateController, CertificateBatchController],
    providers: [...CertificateHandlers, OnChainCertificateWatcher],
    exports: [...CertificateHandlers, OnChainCertificateWatcher]
})
export class CertificateModule {}
