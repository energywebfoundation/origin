import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Device } from './device.entity';
import { DeviceController } from './device.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Device])],
    providers: [],
    controllers: [DeviceController]
})
export class DeviceModule {}
