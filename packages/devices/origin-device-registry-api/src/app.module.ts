import { Module } from '@nestjs/common';

import { DeviceRegistryModule } from './device-registry/device-registry.module';

@Module({
    imports: [DeviceRegistryModule]
})
export class AppModule {}
