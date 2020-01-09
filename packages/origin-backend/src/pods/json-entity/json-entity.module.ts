import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JsonEntity } from './json-entity.entity';
import { JsonEntityController } from './json-entity.controller';

@Module({
    imports: [TypeOrmModule.forFeature([JsonEntity])],
    providers: [],
    controllers: [JsonEntityController]
})
export class JsonEntityModule {}
