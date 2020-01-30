import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { IDemand, DemandStatus, DemandPostData, DemandUpdateData, DemandPartiallyFilled } from '@energyweb/origin-backend-core';

import {
    Controller,
    Get,
    Param,
    NotFoundException,
    Post,
    Body,
    UnprocessableEntityException,
    Delete,
    Put,
    Inject
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Demand } from './demand.entity';
import { StorageErrors } from '../../enums/StorageErrors';
import { EventService } from '../../events/events.service';
import { SupportedEvents, createdNewDemand, DemandPartiallyFilled as DemandPartiallyFilledType } from '../../events/events';

@Controller('/Demand')
export class DemandController {
    constructor(
        @InjectRepository(Demand) private readonly demandRepository: Repository<Demand>,
        @Inject(EventService) private readonly eventService: EventService
    ) {}

    @Get()
    async getAll() {
        console.log(`<GET> Demand all`);

        const allDemands = await this.demandRepository.find();

        for (let demand of allDemands) {
            demand.demandPartiallyFilledEvents = demand.demandPartiallyFilledEvents.map(
                event => JSON.parse(event)
            );
        }

        return allDemands;
    }

    @Get('/:id')
    async get(@Param('id') id: string) {
        const existing = await this.demandRepository.findOne(id, {
            loadRelationIds: true
        });

        if (!existing) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        existing.demandPartiallyFilledEvents = existing.demandPartiallyFilledEvents.map(
            event => JSON.parse(event)
        );

        return existing;
    }

    @Post()
    async post(@Body() body: DemandPostData) {
        let newEntity = new Demand();
        
        const data: Omit<IDemand, 'id'> = {
            ...body,
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
        }

        newEntity = await this.demandRepository.save(newEntity);

        const eventData: createdNewDemand = {
            demandId: newEntity.id
        };

        this.eventService.emit({
            name: SupportedEvents.CREATE_NEW_DEMAND,
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

        if (body.demandPartiallyFilledEvent) {
            existing.demandPartiallyFilledEvents.push(
                JSON.stringify(body.demandPartiallyFilledEvent)
            );
        }

        const hasNewFillEvent = body.demandPartiallyFilledEvent !== null;

        if (hasNewFillEvent) {
            existing.demandPartiallyFilledEvents.push(
                JSON.stringify(body.demandPartiallyFilledEvent)
            );
        }

        try {
            await existing.save();
        } catch (error) {
            throw new UnprocessableEntityException({
                message: `Demand ${id} could not be updated due to an unkown error`
            });
        }

        this.eventService.emit({
            name: SupportedEvents.DEMAND_UPDATED,
            data: { demandId: existing.id }
        });

        if (hasNewFillEvent) {
            const eventData: DemandPartiallyFilledType = {
                demandId: existing.id,
                certificateId: body.demandPartiallyFilledEvent.certificateId,
                energy: body.demandPartiallyFilledEvent.energy,
                blockNumber: body.demandPartiallyFilledEvent.blockNumber
            };
    
            this.eventService.emit({
                name: SupportedEvents.DEMAND_UPDATED,
                data: eventData
            });
        }

        return {
            message: `Demand ${id} successfully updated`
        };
    }
}
