import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CertificationRequest } from './certification-request.entity';
import { CertificateController } from './certificate.controller';
import { UserModule } from '../user/user.module';
import { CertificateService } from './certificate.service';
import { DeviceModule } from '../device/device.module';

@Module({
    imports: [TypeOrmModule.forFeature([CertificationRequest]), UserModule, DeviceModule],
    providers: [CertificateService],
    controllers: [CertificateController]
})
export class CertificationRequestModule {}
