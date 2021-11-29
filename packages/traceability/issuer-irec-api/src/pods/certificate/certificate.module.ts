import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';

import {
    BlockchainPropertiesModule,
    Certificate,
    CertificateBatchController,
    OnChainCertificateWatcher,
    UnminedCommitment
} from '@energyweb/issuer-api';
import { IrecModule } from '@energyweb/origin-organization-irec-api';

import { IrecCertificateController } from './certificate.controller';
import { CertificateHandlers } from './handler';

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([Certificate, UnminedCommitment]),
        BlockchainPropertiesModule,
        IrecModule,
        ConfigModule
    ],
    controllers: [IrecCertificateController, CertificateBatchController],
    providers: [...CertificateHandlers, OnChainCertificateWatcher],
    exports: [...CertificateHandlers, OnChainCertificateWatcher]
})
export class CertificateModule {}
