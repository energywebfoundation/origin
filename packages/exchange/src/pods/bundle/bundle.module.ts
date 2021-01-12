import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BundleItem } from './bundle-item.entity';
import { BundleTrade } from './bundle-trade.entity';
import { BundleController } from './bundle.controller';
import { Bundle } from './bundle.entity';
import { BundleService } from './bundle.service';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([Bundle, BundleTrade, BundleItem]),
        CqrsModule
    ],
    providers: [BundleService],
    exports: [BundleService],
    controllers: [BundleController]
})
export class BundleModule {}
