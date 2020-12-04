import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectionController } from './connection.controller';
import { Connection } from './connection.entity';
import { Handlers } from './handlers';

@Module({
    imports: [TypeOrmModule.forFeature([Connection]), CqrsModule],
    providers: [...Handlers],
    exports: [...Handlers],
    controllers: [ConnectionController]
})
export class ConnectionModule {}
