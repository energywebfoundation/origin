import { Module } from '@nestjs/common';

import { DeviceTypeServiceWrapper } from './deviceTypeServiceWrapper';
import { GridOperatorService } from './grid-operator.service';

@Module({
    imports: [],
    providers: [DeviceTypeServiceWrapper, GridOperatorService],
    exports: [DeviceTypeServiceWrapper, GridOperatorService]
})
export class RunnerModule {}
