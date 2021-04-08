import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import {
    BlockchainPropertiesModule,
    CertificateModule,
    Certificate,
    SyncCertificationRequestsTask
} from '@energyweb/issuer-api';
import { Handlers } from './handlers';
import { CertificationRequest } from './certification-request.entity';
import { CertificationRequestController } from './certification-request.controller';

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([CertificationRequest, Certificate]),
        BlockchainPropertiesModule,
        CertificateModule
    ],
    controllers: [CertificationRequestController],
    providers: [...Handlers, SyncCertificationRequestsTask],
    exports: [...Handlers]
})
export class CertificationRequestModule {}
