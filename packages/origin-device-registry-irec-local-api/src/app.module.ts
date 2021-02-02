import { Module } from '@nestjs/common';

import { DeviceModule } from './device/device.module';

@Module({
    imports: [DeviceModule]
})
export class AppModule {}
