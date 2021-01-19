import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeviceRegistryController } from './device-registry.controller';
import { DeviceRegistryService } from './device-registry.service';
import { Device } from './device.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Device]), CqrsModule],
    providers: [DeviceRegistryService],
    exports: [DeviceRegistryService],
    controllers: [DeviceRegistryController]
})
export class DeviceRegistryModule {}
