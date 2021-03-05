import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeviceRegistryController } from './device-registry.controller';
import { DeviceRegistryService } from './device-registry.service';
import { OriginDevice } from './origin-device.entity';

@Module({
    imports: [TypeOrmModule.forFeature([OriginDevice]), CqrsModule],
    providers: [DeviceRegistryService],
    exports: [DeviceRegistryService],
    controllers: [DeviceRegistryController]
})
export class DeviceRegistryModule {}
