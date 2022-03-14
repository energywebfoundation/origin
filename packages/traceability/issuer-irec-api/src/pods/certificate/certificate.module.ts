import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { IrecCertificateController } from './certificate.controller';
import {
    BlockchainPropertiesModule,
    Certificate,
    CertificateBatchController,
    OnChainCertificateWatcher,
    UnminedCommitment
} from '@energyweb/issuer-api';
import { IrecModule } from '@energyweb/origin-organization-irec-api';


@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([Certificate, UnminedCommitment]),
        BlockchainPropertiesModule,
        IrecModule,
        ConfigModule
    ],
    controllers: [CertificateBatchController, IrecCertificateController],
    providers: [OnChainCertificateWatcher],
    exports: [OnChainCertificateWatcher]
})
export class CertificateModule {}
