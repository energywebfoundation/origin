import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CertificationRequest } from './certification-request.entity';
import { CertificateController } from './certificate.controller';
import { UserModule } from '../user/user.module';
import { CertificationRequestService } from './certification-request.service';
import { DeviceModule } from '../device/device.module';

@Module({
    imports: [TypeOrmModule.forFeature([CertificationRequest]), UserModule, DeviceModule],
    providers: [CertificationRequestService],
    controllers: [CertificateController]
})
export class CertificateModule {}
