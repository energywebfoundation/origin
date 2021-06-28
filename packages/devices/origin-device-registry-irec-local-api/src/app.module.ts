import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { DeviceModule } from './device';

@Module({
    imports: [ScheduleModule.forRoot(), DeviceModule]
})
export class AppModule {}
