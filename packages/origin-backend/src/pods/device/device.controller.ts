import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { IDevice } from '@energyweb/origin-backend-core';

import {
    Controller,
    Get,
    Param,
    NotFoundException,
    Post,
    Body,
    BadRequestException,
    UnprocessableEntityException,
    Delete,
    Put
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Device } from './device.entity';
import { StorageErrors } from '../../enums/StorageErrors';

@Controller('/Device')
export class DeviceController {
    constructor(
        @InjectRepository(Device)
        private readonly deviceRepository: Repository<Device>
    ) {}

    @Get()
    async getAll() {
        console.log(`<GET> Device all`);

        return this.deviceRepository.find();
    }

    @Get('/:id')
    async get(@Param('id') id: string) {
        console.log(`<GET> Device/${id}`);

        const existingEntity = await this.deviceRepository.findOne(id);

        if (!existingEntity) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        return existingEntity;
    }

    @Post('/:id')
    async post(@Param('id') id: string, @Body() body: IDevice) {
        console.log(`<POST> Device`);

        try {
            const newEntity = new Device();

            Object.assign(newEntity, body);
            newEntity.id = Number(id);

            const validationErrors = await validate(newEntity);

            if (validationErrors.length > 0) {
                throw new UnprocessableEntityException({
                    success: false,
                    errors: validationErrors
                });
            } else {
                await this.deviceRepository.save(newEntity);

                return newEntity;
            }
        } catch (error) {
            console.warn('Error while saving entity', error);
            throw new BadRequestException('Could not save device.');
        }
    }

    @Delete('/:id')
    async delete(@Param('id') id: string) {
        console.log(`<DELETE> Device/${id}`);
        const existingEntity = await this.deviceRepository.findOne(id);

        if (!existingEntity) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        await this.deviceRepository.remove(existingEntity);

        return {
            message: `Entity ${id} deleted`
        };
    }
}
