import { ReadsService } from '@energyweb/energy-api-influxdb';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ReadsController } from './reads.controller';

@Module({
    imports: [ConfigModule.forRoot()],
    controllers: [ReadsController],
    providers: [ReadsService]
})
export class ReadsModule {}
