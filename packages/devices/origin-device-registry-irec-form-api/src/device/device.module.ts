import { ISmartMeterReadingsAdapter } from '@energyweb/origin-backend-core';
import { ConfigurationModule } from '@energyweb/origin-backend';
import { DynamicModule, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeviceController } from './device.controller';
import { Device } from './device.entity';
import { DeviceService, SM_READS_ADAPTER } from './device.service';

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
