import { IntUnitsOfEnergy } from '@energyweb/origin-backend-utils';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DemandModule } from './demand';
import { OrderModule } from './order';
import { OrderBookModule } from './order-book';
import { ProductModule } from './product';
import { RunnerModule } from './runner';

@Module({
    imports: [
        ConfigModule,
        OrderModule,
        OrderBookModule,
        ProductModule,
        RunnerModule,
        DemandModule
    ],
    providers: [IntUnitsOfEnergy]
})
export class AppModule {}
