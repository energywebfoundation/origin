import { ISmartMeterReadingsAdapter } from '@energyweb/origin-backend-core';
import { DynamicModule, Module } from '@nestjs/common';

import { DeviceModule } from './device/device.module';

@Module({})
export class AppModule {
    static register(smartMeterReadingsAdapter: ISmartMeterReadingsAdapter): DynamicModule {
        return {
            module: AppModule,
            imports: [DeviceModule.register(smartMeterReadingsAdapter)]
        };
    }
}
