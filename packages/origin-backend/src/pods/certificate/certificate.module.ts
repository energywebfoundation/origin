import { ISmartMeterReadingsAdapter } from '@energyweb/origin-backend-core';
import { DynamicModule, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigurationModule } from '../configuration';
import { DeviceModule } from '../device/device.module';
import { UserModule } from '../user/user.module';
import { CertificateController } from './certificate.controller';
import { Certificate } from './certificate.entity';
import { CertificateService } from './certificate.service';
import { CertificationRequestQueueItem } from './certification-request-queue-item.entity';
import { CertificationRequestWatcherService } from './certification-request-watcher.service';
import { CertificationRequest } from './certification-request.entity';
import { CertificationRequestService } from './certification-request.service';
import { OwnershipCommitment } from './ownership-commitment.entity';

@Module({})
export class CertificateModule {
    static register(smartMeterReadingsAdapter: ISmartMeterReadingsAdapter): DynamicModule {
        return {
            module: CertificateModule,
            imports: [
                TypeOrmModule.forFeature([
                    CertificationRequest,
                    CertificationRequestQueueItem,
                    OwnershipCommitment,
                    Certificate
                ]),
                UserModule,
                ConfigurationModule,
                DeviceModule.register(smartMeterReadingsAdapter),
                CqrsModule
            ],
            providers: [
                CertificateService,
                CertificationRequestService,
                CertificationRequestWatcherService
            ],
            controllers: [CertificateController],
            exports: [
                CertificateService,
                CertificationRequestService,
                CertificationRequestWatcherService
            ]
        };
    }
}
