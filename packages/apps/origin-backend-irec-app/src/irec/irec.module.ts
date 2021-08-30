import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';

import { Handlers } from './handler';

@Module({
    imports: [CqrsModule, PassportModule.register({ defaultStrategy: 'jwt' }), ConfigModule],
    providers: [...Handlers],
    exports: [...Handlers]
})
export class IrecModule {}
