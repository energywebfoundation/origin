import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CqrsModule } from '@nestjs/cqrs';
import { Certificate } from './certificate.entity';
import { CertificateController } from './certificate.controller';
import { BlockchainPropertiesModule } from '../blockchain/blockchain-properties.module';
import { Handlers } from './handlers';
import { OnChainCertificateWatcher } from './listeners/on-chain-certificates.listener';

@Module({
    imports: [CqrsModule, TypeOrmModule.forFeature([Certificate]), BlockchainPropertiesModule],
    controllers: [CertificateController],
    providers: [...Handlers, OnChainCertificateWatcher],
    exports: [...Handlers, OnChainCertificateWatcher]
})
export class CertificateModule {}
