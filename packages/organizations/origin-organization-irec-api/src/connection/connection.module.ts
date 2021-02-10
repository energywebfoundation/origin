import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RegistrationModule } from '../registration';
import { ConnectionController } from './connection.controller';
import { Connection } from './connection.entity';
import { Handlers } from './handlers';
import { IrecConnectionService } from './irec-connection.service';

@Module({
    imports: [TypeOrmModule.forFeature([Connection]), CqrsModule, RegistrationModule],
    providers: [...Handlers, IrecConnectionService],
    exports: [...Handlers, IrecConnectionService],
    controllers: [ConnectionController]
})
export class ConnectionModule {}
