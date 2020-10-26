import { Module, ValidationPipe } from '@nestjs/common';

import { APP_PIPE } from '@nestjs/core';
import { CertificateModule } from './pods/certificate/certificate.module';
import { BlockchainPropertiesModule } from './pods/blockchain/blockchain-properties.module';
import { CertificationRequestModule } from './pods/certification-request/certification-request.module';

export const providers = [{ provide: APP_PIPE, useClass: ValidationPipe }];

@Module({
    imports: [CertificateModule, BlockchainPropertiesModule, CertificationRequestModule],
    providers
})
export class AppModule {}
