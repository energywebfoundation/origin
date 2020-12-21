import { Module } from '@nestjs/common';

import { DemandModule as BaseDemandModule } from '../../src/pods/demand';
import { DemandController } from './demand.controller';

@Module({
    imports: [BaseDemandModule],
    controllers: [DemandController]
})
export class DemandModule {}
