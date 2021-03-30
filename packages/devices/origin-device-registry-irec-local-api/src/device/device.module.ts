import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionModule, RegistrationModule } from '@energyweb/origin-organization-irec-api';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { DeviceController } from './device.controller';
import { Device } from './device.entity';
import { DeviceService } from './device.service';
import { ValidateDeviceOwnershipCommandHandler } from './handlers/validate-device-ownership.handler';
import { IrecDeviceService } from './irec-device.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Device]),
        CqrsModule,
        ConfigModule,
        ConnectionModule,
        RegistrationModule,
        PassportModule.register({ defaultStrategy: 'jwt' })
    ],
    providers: [DeviceService, IrecDeviceService, ValidateDeviceOwnershipCommandHandler],
    exports: [DeviceService, IrecDeviceService],
    controllers: [DeviceController]
})
export class DeviceModule {}
