import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Device } from './device.entity';
import { DeviceController } from './device.controller';
import { EventsModule } from '../../events/events.module';
import { DeviceService } from './device.service';

@Module({
    imports: [TypeOrmModule.forFeature([Device]), EventsModule],
    providers: [DeviceService],
    controllers: [DeviceController],
    exports: [DeviceService]
})
export class DeviceModule {}
