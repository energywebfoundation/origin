import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule as IrecOrganizationModule } from '@energyweb/origin-organization-irec-api';

import { DeviceController } from './device.controller';
import { Device } from './device.entity';
import { DeviceService } from './device.service';
import { ValidateDeviceOwnershipCommandHandler } from './handlers/validate-device-ownership.handler';

@Module({
    imports: [TypeOrmModule.forFeature([Device]), CqrsModule, IrecOrganizationModule],
    providers: [DeviceService, ValidateDeviceOwnershipCommandHandler],
    exports: [DeviceService],
    controllers: [DeviceController]
})
export class DeviceModule {}
