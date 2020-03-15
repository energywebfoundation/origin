import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeviceTypesController } from './device-types.controller';
import { DeviceTypes } from './device-types.entity';
import { DeviceTypesService } from './device-types.service';

@Module({
    imports: [TypeOrmModule.forFeature([DeviceTypes])],
    providers: [DeviceTypesService],
    controllers: [DeviceTypesController],
    exports: [DeviceTypesService]
})
export class DeviceTypesModule {}
