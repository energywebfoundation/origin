import { ISmartMeterReadingsAdapter } from '@energyweb/origin-backend-core';
import { SM_READS_ADAPTER } from '@energyweb/origin-backend/src/const';
import { ConfigurationModule } from '@energyweb/origin-backend/src/pods/configuration';
import { DynamicModule, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeviceController } from './device.controller';
import { Device } from './device.entity';
import { DeviceService } from './device.service';

@Module({})
export class DeviceModule {
    static register(smartMeterReadingsAdapter: ISmartMeterReadingsAdapter): DynamicModule {
        return {
            module: DeviceModule,
            imports: [TypeOrmModule.forFeature([Device]), ConfigurationModule, CqrsModule],
            providers: [
                {
                    provide: SM_READS_ADAPTER,
                    useValue: smartMeterReadingsAdapter
                },
                DeviceService
            ],
            controllers: [DeviceController],
            exports: [DeviceService]
        };
    }
}
