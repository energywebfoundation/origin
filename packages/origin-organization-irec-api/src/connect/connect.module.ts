import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Connect } from './connect.entity';
import { ConnectController } from './connect.controller';
import { ConnectService } from './connect.service';

@Module({
    imports: [TypeOrmModule.forFeature([Connect])],
    providers: [ConnectService],
    exports: [ConnectService],
    controllers: [ConnectController]
})
export class ConnectModule {}
