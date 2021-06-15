import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';

import { FileModule, UserModule } from '@energyweb/origin-backend';
import { ConnectionModule } from '@energyweb/origin-organization-irec-api';
import {
    BlockchainPropertiesModule,
    Certificate,
    CertificationRequest,
    SyncCertificationRequestsTask
} from '@energyweb/issuer-api';

import { CertificateModule } from '../certificate';
import { IrecModule } from '../irec';
import { Handlers } from './handlers';
import { IrecCertificationRequest } from './irec-certification-request.entity';
import { CertificationRequestController } from './certification-request.controller';

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([CertificationRequest, Certificate, IrecCertificationRequest]),
        BlockchainPropertiesModule,
        CertificateModule,
        ConfigModule,
        UserModule,
        FileModule,
        ConnectionModule,
        IrecModule
    ],
    controllers: [CertificationRequestController],
    providers: [...Handlers, SyncCertificationRequestsTask],
    exports: [...Handlers]
})
export class CertificationRequestModule {}
