import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { IDemand, DemandStatus, DemandPostData } from '@energyweb/origin-backend-core';

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
    Put,
    UseGuards
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Demand } from './demand.entity';
import { StorageErrors } from '../../enums/StorageErrors';

@Controller('/Demand')
export class DemandController {
    constructor(
        @InjectRepository(Demand)
        private readonly demandRepository: Repository<Demand>
    ) {}

    @Get()
    async getAll() {
        console.log(`<GET> Demand all`);

        return this.demandRepository.find();
    }

    @Get('/:id')
    async get(@Param('id') id: string) {
        const existingEntity = await this.demandRepository.findOne(id, {
            loadRelationIds: true
        });

        if (!existingEntity) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        return existingEntity;
    }

    @Post()
    async post(@Body() body: any) {
        try {
            const newEntity = new Demand();

            const data: Omit<IDemand, 'id'> = {
                ...(body as DemandPostData),
                status: DemandStatus.ACTIVE,
                demandPartiallyFilledEvents: []
            };

            Object.assign(newEntity, data);

            const validationErrors = await validate(newEntity);

            if (validationErrors.length > 0) {
                throw new UnprocessableEntityException({
                    success: false,
                    errors: validationErrors
                });
            } else {
                await this.demandRepository.save(newEntity);

                return newEntity;
            }
        } catch (error) {
            console.warn('Error while saving entity', error);
            throw new BadRequestException('Could not save Demand.');
        }
    }

    @Delete('/:id')
    async delete(@Param('id') id: string) {
        const existing = await this.demandRepository.findOne(id);

        if (!existing) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }
        
        existing.status = DemandStatus.ARCHIVED;

        try {
            await existing.save();

            return {
                message: `Demand ${id} successfully archived`
            };
        } catch (error) {
            throw new UnprocessableEntityException({
                message: `Demand ${id} could not be archived due to an unknown error`
            });
        }
    }

    @Put('/:id')
    async put(@Param('id') id: string, @Body() body: any) {
        const existing = await this.demandRepository.findOne(id);

        if (!existing) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        existing.status = body.status;

        try {
            await existing.save();

            return {
                message: `Demand ${id} successfully updated`
            };
        } catch (error) {
            throw new UnprocessableEntityException({
                message: `Demand ${id} could not be updated due to an unkown error`
            });
        }
    }
}
