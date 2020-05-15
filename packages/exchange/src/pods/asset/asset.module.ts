import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Asset } from './asset.entity';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Asset])],
    providers: [AssetService],
    exports: [AssetService],
    controllers: [AssetController]
})
export class AssetModule {}
