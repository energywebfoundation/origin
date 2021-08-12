import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CqrsModule } from '@nestjs/cqrs';
import { Certificate } from './certificate.entity';
import { CertificateController } from './certificate.controller';
import { BlockchainPropertiesModule } from '../blockchain';
import { CertificateHandlers } from './handlers';
import { OnChainCertificateWatcher } from './listeners';
import { CertificateBatchController } from './certificate-batch.controller';
import { TransactionLog } from './transaction-log.entity';
import { TransactionLogService } from './transaction-log.service';

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([Certificate, TransactionLog]),
        BlockchainPropertiesModule
    ],
    controllers: [CertificateController, CertificateBatchController],
    providers: [...CertificateHandlers, OnChainCertificateWatcher, TransactionLogService],
    exports: [...CertificateHandlers, OnChainCertificateWatcher]
})
export class CertificateModule {}
