import { Module } from '@nestjs/common';

import { DeviceModule } from './device';

@Module({
    imports: [DeviceModule]
})
export class AppModule {}
