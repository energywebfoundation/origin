import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ISmartMeterReadingsAdapter } from '@energyweb/origin-backend-core';
import { CertificationRequest } from './certification-request.entity';
import { CertificateController } from './certificate.controller';
import { UserModule } from '../user/user.module';
import { DeviceModule } from '../device/device.module';

@Module({})
export class CertificateModule {
    static register(smartMeterReadingsAdapter: ISmartMeterReadingsAdapter): DynamicModule {
        return {
            module: CertificateModule,
            imports: [
                TypeOrmModule.forFeature([CertificationRequest]),
                UserModule,
                DeviceModule.register(smartMeterReadingsAdapter)
            ],
            providers: [],
            controllers: [CertificateController]
        };
    }
}
