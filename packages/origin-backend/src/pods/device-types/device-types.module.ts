import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeviceTypesController } from './device-types.controller';
import { DeviceTypes } from './device-types.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DeviceTypes])],
    providers: [],
    controllers: [DeviceTypesController]
})
export class DeviceTypesModule {}
