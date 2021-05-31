import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { OrganizationModule, UserModule } from '@energyweb/origin-backend';

import { IrecService } from './irec.service';
import { Handlers } from './handler';

@Module({
    imports: [
        CqrsModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        ConfigModule,
        OrganizationModule,
        UserModule
    ],
    providers: [...Handlers, IrecService],
    exports: [...Handlers, IrecService]
})
export class IrecModule {}
