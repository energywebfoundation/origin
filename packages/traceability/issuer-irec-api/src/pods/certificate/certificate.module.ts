import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import {
    Certificate,
    OnChainCertificateWatcher,
    BlockchainPropertiesModule
} from '@energyweb/issuer-api';

import { IrecModule } from '../irec';
import { IrecCertificateController } from './certificate.controller';
import { IrecCertificate } from './irec-certificate.entity';
import { CertificateHandlers } from './handler';

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([Certificate, IrecCertificate]),
        BlockchainPropertiesModule,
        IrecModule
    ],
    controllers: [IrecCertificateController],
    providers: [...CertificateHandlers, OnChainCertificateWatcher],
    exports: [...CertificateHandlers, OnChainCertificateWatcher]
})
export class CertificateModule {}
