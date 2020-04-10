import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ISmartMeterReadingsAdapter } from '@energyweb/origin-backend-core';
import { Device } from './device.entity';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { SM_READS_ADAPTER } from '../../const';
import { OrganizationModule } from '../organization';
import { ConfigurationModule } from '../configuration';

@Module({})
export class DeviceModule {
    static register(smartMeterReadingsAdapter: ISmartMeterReadingsAdapter): DynamicModule {
        return {
            module: DeviceModule,
            imports: [TypeOrmModule.forFeature([Device]), ConfigurationModule, OrganizationModule],
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
