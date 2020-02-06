import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from './order.entity';
import { OrderService } from './order.service';
import { MatchingEngineModule } from '../matching-engine/matching-engine.module';
import { OrderController } from './order.controller';
import { AccountModule } from '../account/account.module';

@Module({
    providers: [OrderService],
    exports: [OrderService],
    imports: [
        TypeOrmModule.forFeature([Order]),
        MatchingEngineModule,
        forwardRef(() => AccountModule)
    ],
    controllers: [OrderController]
})
export class OrderModule {}
