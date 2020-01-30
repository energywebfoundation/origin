import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Device } from './device.entity';
import { DeviceController } from './device.controller';
import { EventsModule } from '../../events/events.module';

@Module({
    imports: [TypeOrmModule.forFeature([Device]), EventsModule],
    providers: [],
    controllers: [DeviceController]
})
export class DeviceModule {}
