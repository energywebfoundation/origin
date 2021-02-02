import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeviceController } from './device.controller';
import { Device } from './device.entity';
import { DeviceService, IDeviceServiceIREC } from './device.service';
import { ValidateDeviceOwnershipCommandHandler } from './handlers/validate-device-ownership.handler';

const deviceService = {
    provide: IDeviceServiceIREC,
    useClass: DeviceService
};

@Module({
    imports: [TypeOrmModule.forFeature([Device]), CqrsModule],
    providers: [DeviceService, deviceService, ValidateDeviceOwnershipCommandHandler],
    exports: [DeviceService, deviceService],
    controllers: [DeviceController]
})
export class DeviceModule {}
