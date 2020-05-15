import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ISmartMeterReadingsAdapter } from '@energyweb/origin-backend-core';

import { CertificationRequest } from './certification-request.entity';
import { CertificateController } from './certificate.controller';
import { UserModule } from '../user/user.module';
import { OwnershipCommitment } from './ownership-commitment.entity';
import { Certificate } from './certificate.entity';
import { ConfigurationModule } from '../configuration';
import { DeviceModule } from '../device/device.module';
import { CertificationRequestService } from './certification-request.service';
import { CertificationRequestWatcherService } from './certification-request-watcher.service';

@Module({})
export class CertificateModule {
    static register(smartMeterReadingsAdapter: ISmartMeterReadingsAdapter): DynamicModule {
        return {
            module: CertificateModule,
            imports: [
                TypeOrmModule.forFeature([CertificationRequest, OwnershipCommitment, Certificate]),
                UserModule,
                ConfigurationModule,
                DeviceModule.register(smartMeterReadingsAdapter)
            ],
            providers: [CertificationRequestService, CertificationRequestWatcherService],
            controllers: [CertificateController],
            exports: [CertificationRequestService, CertificationRequestWatcherService]
        };
    }
}
