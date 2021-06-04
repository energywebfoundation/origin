import { Module } from '@nestjs/common';
import { IrecService } from './irec.service';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
    imports: [ConfigModule, CqrsModule],
    providers: [IrecService],
    exports: [IrecService],
    controllers: []
})
export class IrecModule {}
