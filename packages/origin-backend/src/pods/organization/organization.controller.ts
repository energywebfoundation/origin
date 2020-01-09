import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import {
    OrganizationStatus,
    OrganizationPostData,
    IOrganization
} from '@energyweb/origin-backend-core';

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

import { Organization } from './organization.entity';
import { StorageErrors } from '../../enums/StorageErrors';

@Controller('/Organization')
export class OrganizationController {
    constructor(
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>
    ) {}

    @Get()
    async getAll() {
        console.log(`<GET> Organization all`);

        return this.organizationRepository.find();
    }

    @Get('/:id')
    async get(@Param('id') id: string) {
        console.log(`<GET> Organization/${id}`);

        const existingEntity = await this.organizationRepository.findOne(id);

        if (!existingEntity) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        return existingEntity;
    }

    @Post()
    async post(@Body() body: any) {
        console.log(`<POST> Organization`);

        try {
            const newEntity = new Organization();

            const data: Omit<IOrganization, 'id'> = {
                ...(body as OrganizationPostData),
                status: OrganizationStatus.Submitted
            };

            Object.assign(newEntity, data);

            const validationErrors = await validate(newEntity);

            if (validationErrors.length > 0) {
                throw new UnprocessableEntityException({
                    success: false,
                    errors: validationErrors
                });
            } else {
                await this.organizationRepository.save(newEntity);

                return newEntity;
            }
        } catch (error) {
            console.warn('Error while saving entity', error);
            throw new BadRequestException('Could not save organization.');
        }
    }

    @Delete('/:id')
    async delete(@Param('id') id: string) {
        console.log(`<DELETE> Organization/${id}`);
        const existingEntity = await this.organizationRepository.findOne(id);

        if (!existingEntity) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        await this.organizationRepository.remove(existingEntity);

        return {
            message: `Entity ${id} deleted`
        };
    }

    @Put('/:id')
    async put(@Param('id') id: string, @Body() body: any) {
        console.log(`<PUT> Organization/${id}`);

        const existingEntity = await this.organizationRepository.findOne(id);

        if (!existingEntity) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        existingEntity.status = body.status;

        try {
            await existingEntity.save();

            return {
                message: `Entity ${id} successfully updated`
            };
        } catch (error) {
            throw new UnprocessableEntityException({
                message: `Entity ${id} could not be updated due to an unkown error`
            });
        }
    }
}
