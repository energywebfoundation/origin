import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeviceController } from './device.controller';
import { Device } from './device.entity';
import { DeviceService } from './device.service';
import { ValidateDeviceOwnershipCommandHandler } from './handlers/validate-device-ownership.handler';

@Module({
    imports: [TypeOrmModule.forFeature([Device]), CqrsModule],
    providers: [DeviceService, ValidateDeviceOwnershipCommandHandler],
    exports: [DeviceService],
    controllers: [DeviceController]
})
export class DeviceModule {}
