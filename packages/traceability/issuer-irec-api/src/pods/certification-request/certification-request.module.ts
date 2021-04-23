import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';

import {
    BlockchainPropertiesModule,
    CertificateModule,
    Certificate,
    SyncCertificationRequestsTask
} from '@energyweb/issuer-api';

import { Handlers } from './handlers';
import { CertificationRequest } from './certification-request.entity';
import { CertificationRequestController } from './certification-request.controller';
import { IrecCertificateService } from './irec-certificate.service';

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([CertificationRequest, Certificate]),
        BlockchainPropertiesModule,
        CertificateModule,
        ConfigModule
    ],
    controllers: [CertificationRequestController],
    providers: [...Handlers, SyncCertificationRequestsTask, IrecCertificateService],
    exports: [...Handlers]
})
export class CertificationRequestModule {}
