import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigurationModule } from '../configuration';
import { UserModule } from '../user/user.module';
import { CertificateController } from './certificate.controller';
import { Certificate } from './certificate.entity';
import { CertificateService } from './certificate.service';
import { OwnershipCommitment } from './ownership-commitment.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([OwnershipCommitment, Certificate]),
        UserModule,
        ConfigurationModule
    ],
    providers: [CertificateService],
    controllers: [CertificateController],
    exports: [CertificateService]
})
export class CertificateModule {}
