import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainProperties } from './blockchain-properties.entity';
import { BlockchainPropertiesService } from './blockchain-properties.service';

@Module({
    imports: [TypeOrmModule.forFeature([BlockchainProperties])],
    providers: [BlockchainPropertiesService],
    exports: [BlockchainPropertiesService]
})
export class BlockchainPropertiesModule {}
