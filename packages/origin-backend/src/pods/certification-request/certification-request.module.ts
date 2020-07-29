import { ISmartMeterReadingsAdapter } from '@energyweb/origin-backend-core';
import { DynamicModule, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigurationModule } from '../configuration';
import { DeviceModule } from '../device/device.module';
import { UserModule } from '../user/user.module';
import { CertificationRequestQueueItem } from './certification-request-queue-item.entity';
import { CertificationRequestWatcherService } from './certification-request-watcher.service';
import { CertificationRequest } from './certification-request.entity';
import { CertificationRequestService } from './certification-request.service';
import { CertificationRequestController } from './certification-request.controller';
import { CertificateModule } from '../certificate';

@Module({})
export class CertificationRequestModule {
    static register(smartMeterReadingsAdapter: ISmartMeterReadingsAdapter): DynamicModule {
        return {
            module: CertificationRequestModule,
            imports: [
                TypeOrmModule.forFeature([CertificationRequest, CertificationRequestQueueItem]),
                UserModule,
                ConfigurationModule,
                DeviceModule.register(smartMeterReadingsAdapter),
                CqrsModule,
                CertificateModule
            ],
            providers: [CertificationRequestService, CertificationRequestWatcherService],
            controllers: [CertificationRequestController],
            exports: [CertificationRequestService, CertificationRequestWatcherService]
        };
    }
}
