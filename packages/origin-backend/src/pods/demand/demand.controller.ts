import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import {
    IDemand,
    DemandStatus,
    DemandPostData,
    DemandUpdateData,
    SupportedEvents,
    CreatedNewDemand,
    DemandPartiallyFilledEvent
} from '@energyweb/origin-backend-core';

import {
    Controller,
    Get,
    Param,
    NotFoundException,
    Post,
    Body,
    UnprocessableEntityException,
    Delete,
    Put
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Demand } from './demand.entity';
import { StorageErrors } from '../../enums/StorageErrors';
import { EventsService } from '../events';

@Controller('/Demand')
export class DemandController {
    constructor(
        @InjectRepository(Demand) private readonly demandRepository: Repository<Demand>,
        private readonly eventsService: EventsService
    ) {}

    @Get()
    async getAll() {
        return this.demandRepository.find();
    }

    @Get('/:id')
    async get(@Param('id') id: string) {
        const existing = await this.demandRepository.findOne(id, {
            loadRelationIds: true
        });

        if (!existing) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        return existing;
    }

    @Post()
    async post(@Body() body: DemandPostData) {
        let newEntity = new Demand();

        const data: Omit<IDemand, 'id'> = {
            ...body,
            status: DemandStatus.ACTIVE,
            demandPartiallyFilledEvents: [],
            location: body.location ?? [],
            deviceType: body.deviceType ?? [],
            otherGreenAttributes: body.otherGreenAttributes ?? '',
            typeOfPublicSupport: body.typeOfPublicSupport ?? '',
            registryCompliance: body.registryCompliance ?? '',
            procureFromSingleFacility: body.procureFromSingleFacility ?? false,
            vintage: body.vintage ?? [1900, 2100]
        };

        Object.assign(newEntity, data);

        const validationErrors = await validate(newEntity);

        if (validationErrors.length > 0) {
            throw new UnprocessableEntityException({
                success: false,
                errors: validationErrors
            });
        }

        newEntity = await this.demandRepository.save(newEntity);

        const eventData: CreatedNewDemand = {
            demandId: newEntity.id
        };

        this.eventsService.handleEvent({
            type: SupportedEvents.CREATE_NEW_DEMAND,
            data: eventData
        });

        return newEntity;
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
    async put(@Param('id') id: string, @Body() body: DemandUpdateData) {
        const existing = await this.demandRepository.findOne(id);

        if (!existing) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        existing.status = body.status ?? existing.status;

        const hasNewFillEvent = body.demandPartiallyFilledEvent !== null;

        if (hasNewFillEvent) {
            existing.demandPartiallyFilledEvents.push(body.demandPartiallyFilledEvent);
        }

        try {
            await existing.save();
        } catch (error) {
            throw new UnprocessableEntityException({
                message: `Demand ${id} could not be updated due to an unkown error`
            });
        }

        this.eventsService.handleEvent({
            type: SupportedEvents.DEMAND_UPDATED,
            data: { demandId: existing.id }
        });

        if (hasNewFillEvent) {
            const eventData: DemandPartiallyFilledEvent = {
                demandId: existing.id,
                certificateId: body.demandPartiallyFilledEvent.certificateId,
                energy: body.demandPartiallyFilledEvent.energy,
                blockNumber: body.demandPartiallyFilledEvent.blockNumber
            };

            this.eventsService.handleEvent({
                type: SupportedEvents.DEMAND_PARTIALLY_FILLED,
                data: eventData
            });
        }

        return {
            message: `Demand ${id} successfully updated`
        };
    }
}
