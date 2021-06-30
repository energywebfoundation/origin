import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CqrsModule } from '@nestjs/cqrs';
import { Certificate } from './certificate.entity';
import { CertificateController } from './certificate.controller';
import { BlockchainPropertiesModule } from '../blockchain';
import { CertificateHandlers } from './handlers';
import { OnChainCertificateWatcher } from './listeners';
import { CertificateBatchController } from './certificate-batch.controller';

@Module({
    imports: [CqrsModule, TypeOrmModule.forFeature([Certificate]), BlockchainPropertiesModule],
    controllers: [CertificateController, CertificateBatchController],
    providers: [...CertificateHandlers, OnChainCertificateWatcher],
    exports: [...CertificateHandlers, OnChainCertificateWatcher]
})
export class CertificateModule {}
