import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { IDevice, DeviceStatus, DeviceUpdateData, SupportedEvents, DeviceStatusChanged } from '@energyweb/origin-backend-core';
import { EventsWebSocketGateway } from '../../events/events.gateway';

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
    Inject
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Device } from './device.entity';
import { StorageErrors } from '../../enums/StorageErrors';

@Controller('/Device')
export class DeviceController {
    constructor(
        @InjectRepository(Device) private readonly deviceRepository: Repository<Device>,
        @Inject(EventsWebSocketGateway) private readonly eventGateway: EventsWebSocketGateway
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

        const newEntity = new Device();

        Object.assign(newEntity, {
            ...body,
            status: DeviceStatus.Submitted
        });

        newEntity.deviceGroup = body.deviceGroup ?? '';
        newEntity.id = Number(id);

        const validationErrors = await validate(newEntity);
        
        if (validationErrors.length > 0) {
            throw new UnprocessableEntityException({
                success: false,
                errors: validationErrors
            });
        } 

        try {
            await this.deviceRepository.save(newEntity);

            return newEntity;
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

    @Put('/:id')
    async put(@Param('id') id: string, @Body() body: DeviceUpdateData) {
        const existing = await this.deviceRepository.findOne(id);

        if (!existing) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        existing.status = body.status;

        try {
            await existing.save();

            const event: DeviceStatusChanged = {
                deviceId: id,
                status: body.status
            };
    
            this.eventGateway.handleEvent({
                type: SupportedEvents.DEVICE_STATUS_CHANGED,
                data: event
            });

            return {
                message: `Device ${id} successfully updated`
            };
        } catch (error) {
            throw new UnprocessableEntityException({
                message: `Device ${id} could not be updated due to an unknown error`
            });
        }
    }
}
