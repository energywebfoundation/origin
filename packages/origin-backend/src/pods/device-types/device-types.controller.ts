import {
    Controller,
    Get,
    NotFoundException,
    Post,
    Body,
    BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StorageErrors } from '../../enums/StorageErrors';
import { DeviceTypes } from './device-types.entity';

@Controller('device-types')
export class DeviceTypesController {
    constructor(
        @InjectRepository(DeviceTypes)
        private readonly repository: Repository<DeviceTypes>
    ) {}

    @Get()
    async get() {
        const entity = await this.repository.findOne();

        if (!entity) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        return JSON.parse(entity?.content);
    }

    @Post()
    async post(@Body('value') value: any) {
        const allEntities = await this.repository.find();

        if (allEntities.length > 0) {
            throw new BadRequestException(StorageErrors.ALREADY_EXISTS);
        }

        const entity = await this.repository
            .create({
                content: JSON.stringify(value)
            })
            .save();

        return this.normalizeEntity(entity);
    }

    private normalizeEntity(entity: DeviceTypes) {
        return JSON.parse(entity?.content);
    }
}
