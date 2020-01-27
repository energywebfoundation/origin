import { Controller, Get, Param, Post, NotFoundException, Body, Delete } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JsonEntity } from './json-entity.entity';
import { StorageErrors } from '../../enums/StorageErrors';

@Controller('entity/:hash')
export class JsonEntityController {
    constructor(
        @InjectRepository(JsonEntity)
        private readonly jsonEntityRepository: Repository<JsonEntity>
    ) {}

    @Get()
    async get(@Param('hash') hash: string) {
        if (hash === undefined || hash === null) {
            const allEntities = await this.jsonEntityRepository.find();

            return allEntities;
        }

        const existingEntity = await this.jsonEntityRepository.findOne({ hash });

        if (!existingEntity) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        return JSON.parse(existingEntity.value);
    }

    @Post()
    async post(@Param('hash') hash: string, @Body() body: any) {
        const exists = (await this.jsonEntityRepository.count({ hash })) > 0;

        if (exists) {
            return {
                message: StorageErrors.ALREADY_EXISTS
            };
        }

        const newEntity = new JsonEntity();

        newEntity.hash = hash;
        newEntity.value = JSON.stringify(body);

        await this.jsonEntityRepository.save(newEntity);

        return {
            message: `Entity ${hash} created`
        };
    }

    @Delete()
    async delete(@Param('hash') hash: string) {
        const existingEntity = await this.jsonEntityRepository.findOne({ hash });

        if (!existingEntity) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        await this.jsonEntityRepository.remove(existingEntity);

        return {
            message: `Entity ${hash} deleted`
        };
    }
}
