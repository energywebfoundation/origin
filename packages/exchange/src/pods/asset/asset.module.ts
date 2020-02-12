import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Asset } from './asset.entity';
import { AssetService } from './asset.service';

@Module({
    imports: [TypeOrmModule.forFeature([Asset])],
    providers: [AssetService],
    exports: [AssetService]
})
export class AssetModule {}
