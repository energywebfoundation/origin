import { Module } from '@nestjs/common';

import { DeviceTypeServiceWrapper } from './deviceTypeServiceWrapper';

@Module({
    imports: [],
    providers: [DeviceTypeServiceWrapper],
    exports: [DeviceTypeServiceWrapper]
})
export class RunnerModule {}
