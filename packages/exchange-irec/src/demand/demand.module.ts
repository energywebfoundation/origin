import { DemandModule as BaseDemandModule } from '@energyweb/exchange';
import { Module } from '@nestjs/common';

import { DemandController } from './demand.controller';

@Module({
    imports: [BaseDemandModule],
    controllers: [DemandController]
})
export class DemandModule {}
