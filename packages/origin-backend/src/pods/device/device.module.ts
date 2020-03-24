import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ISmartMeterReadingsAdapter } from '@energyweb/origin-backend-core';
import { Device } from './device.entity';
import { DeviceController } from './device.controller';
import { EventsModule } from '../events';
import { DeviceService } from './device.service';
import { SM_READS_ADAPTER } from '../../const';

@Module({})
export class DeviceModule {
    static register(smartMeterReadingsAdapter: ISmartMeterReadingsAdapter): DynamicModule {
        return {
            module: DeviceModule,
            imports: [TypeOrmModule.forFeature([Device]), EventsModule],
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
