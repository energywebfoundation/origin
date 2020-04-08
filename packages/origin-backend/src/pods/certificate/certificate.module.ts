import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ISmartMeterReadingsAdapter } from '@energyweb/origin-backend-core';
import { CertificationRequest } from './certification-request.entity';
import { CertificateController } from './certificate.controller';
import { UserModule } from '../user/user.module';
import { DeviceModule } from '../device/device.module';
import { OwnershipCommitment } from './ownership-commitment.entity';
import { Certificate } from './certificate.entity';

@Module({})
export class CertificateModule {
    static register(smartMeterReadingsAdapter: ISmartMeterReadingsAdapter): DynamicModule {
        return {
            module: CertificateModule,
            imports: [
                TypeOrmModule.forFeature([CertificationRequest, OwnershipCommitment, Certificate]),
                UserModule,
                DeviceModule.register(smartMeterReadingsAdapter)
            ],
            providers: [],
            controllers: [CertificateController]
        };
    }
}
