import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import {
    ConnectionModule,
    IrecModule,
    RegistrationModule
} from '@energyweb/origin-organization-irec-api';
import { UserModule } from '@energyweb/origin-backend';
import { DeviceController } from './device.controller';
import { Device } from './device.entity';
import { DeviceService } from './device.service';
import { ValidateDeviceOwnershipCommandHandler } from './handlers/validate-device-ownership.handler';

@Module({
    imports: [
        TypeOrmModule.forFeature([Device]),
        CqrsModule,
        ConfigModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        UserModule,
        ConnectionModule,
        RegistrationModule,
        IrecModule
    ],
    providers: [DeviceService, ValidateDeviceOwnershipCommandHandler],
    exports: [DeviceService],
    controllers: [DeviceController]
})
export class DeviceModule {}
