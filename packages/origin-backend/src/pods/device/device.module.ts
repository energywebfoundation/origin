import { ISmartMeterReadingsAdapter } from '@energyweb/origin-backend-core';
import { DynamicModule, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SM_READS_ADAPTER } from '../../const';
import { ConfigurationModule } from '../configuration';
import { DeviceController } from './device.controller';
import { Device } from './device.entity';
import { DeviceService, IDeviceService } from './device.service';

const deviceService = {
    provide: IDeviceService,
    useClass: DeviceService
};

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
                DeviceService,
                deviceService
            ],
            controllers: [DeviceController],
            exports: [DeviceService, deviceService]
        };
    }
}
