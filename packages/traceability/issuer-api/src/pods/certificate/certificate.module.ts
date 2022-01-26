import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { Certificate } from './certificate.entity';
import { CertificateController } from './certificate.controller';
import { BlockchainPropertiesModule } from '../blockchain';
import { CertificateHandlers } from './handlers';
import { OnChainCertificateWatcher } from './listeners';
import { CertificateBatchController } from './certificate-batch.controller';
import { UnminedCommitment } from './unmined-commitment.entity';

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([Certificate, UnminedCommitment]),
        BlockchainPropertiesModule,
        ConfigModule
    ],
    controllers: [CertificateController, CertificateBatchController],
    providers: [...CertificateHandlers, OnChainCertificateWatcher],
    exports: [...CertificateHandlers, OnChainCertificateWatcher]
})
export class CertificateModule {}
