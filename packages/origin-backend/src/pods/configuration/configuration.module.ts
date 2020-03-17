import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Configuration } from './configuration.entity';
import { ConfigurationService } from './configuration.service';
import { ConfigurationController } from './configuration.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Configuration])],
    providers: [ConfigurationService],
    controllers: [ConfigurationController],
    exports: [ConfigurationService]
})
export class ConfigurationModule {}
