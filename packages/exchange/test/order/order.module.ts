import { Module } from '@nestjs/common';

import { IOrderMapperService } from '../../src/interfaces/IOrderMapperService';
import { OrderModule as BaseOrderModule } from '../../src/pods/order';
import { OrderMapperService } from './order-mapper.service';
import { OrderController } from './order.controller';

@Module({
    providers: [{ provide: IOrderMapperService, useClass: OrderMapperService }],
    controllers: [OrderController],
    imports: [BaseOrderModule]
})
export class OrderModule {}
