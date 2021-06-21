import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';

import { RegistrationModule } from '../registration';
import { IrecModule, IrecService } from '../irec';
import { ConnectionController } from './connection.controller';
import { Connection } from './connection.entity';
import { ConnectionHandlers } from './handlers';
import { RefreshAllTokensTask } from './cron';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([Connection]),
        ConfigModule,
        CqrsModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        RegistrationModule,
        IrecModule
    ],
    providers: [...ConnectionHandlers, IrecService, RefreshAllTokensTask],
    exports: [...ConnectionHandlers],
    controllers: [ConnectionController]
})
export class ConnectionModule {}
