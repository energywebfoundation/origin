import { IOrderMapperService, OrderModule as BaseOrderModule } from '@energyweb/exchange';
import { Module } from '@nestjs/common';

import { RunnerModule } from '../runner';
import { OrderMapperService } from './order-mapper.service';
import { OrderController } from './order.controller';

@Module({
    providers: [{ provide: IOrderMapperService, useClass: OrderMapperService }],
    imports: [BaseOrderModule, RunnerModule],
    controllers: [OrderController]
})
export class OrderModule {}
