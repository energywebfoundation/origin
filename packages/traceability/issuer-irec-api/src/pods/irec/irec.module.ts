import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';

import { IrecService } from './irec.service';

@Module({
    imports: [CqrsModule, ConfigModule],
    controllers: [],
    providers: [IrecService],
    exports: [IrecService]
})
export class IrecModule {}
