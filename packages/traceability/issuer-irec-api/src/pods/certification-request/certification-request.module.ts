import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';

import { FileModule, UserModule } from '@energyweb/origin-backend';
import {
    BlockchainPropertiesModule,
    CertificateModule,
    Certificate,
    SyncCertificationRequestsTask,
    CertificationRequest
} from '@energyweb/issuer-api';

import { Handlers } from './handlers';
import { IrecCertificationRequest } from './irec-certification-request.entity';
import { CertificationRequestController } from './certification-request.controller';
import { IrecCertificateService } from './irec-certificate.service';

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([CertificationRequest, Certificate, IrecCertificationRequest]),
        BlockchainPropertiesModule,
        CertificateModule,
        ConfigModule,
        UserModule,
        FileModule
    ],
    controllers: [CertificationRequestController],
    providers: [...Handlers, SyncCertificationRequestsTask, IrecCertificateService],
    exports: [...Handlers]
})
export class CertificationRequestModule {}
