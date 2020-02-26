import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import {
    IDevice,
    DeviceStatus,
    DeviceUpdateData,
    SupportedEvents,
    DeviceStatusChanged,
    ISmartMeterRead
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
    Put,
    Inject
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventsWebSocketGateway } from '../../events/events.gateway';

import { Device } from './device.entity';
import { StorageErrors } from '../../enums/StorageErrors';
import { DeviceService } from './device.service';

@Controller('/Device')
export class DeviceController {
    constructor(
        @InjectRepository(Device) private readonly deviceRepository: Repository<Device>,
        @Inject(EventsWebSocketGateway) private readonly eventGateway: EventsWebSocketGateway,
        private readonly deviceService: DeviceService
    ) {}

    @Get()
    async getAll() {
        return this.deviceRepository.find();
    }

    @Get('/:id')
    async get(@Param('id') id: string) {
        const existingEntity = await this.deviceService.findOne(id);

        if (!existingEntity) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        return existingEntity;
    }

    @Post('/:id')
    async post(@Param('id') id: string, @Body() body: IDevice) {
        const newEntity = new Device();

        Object.assign(newEntity, {
            ...body,
            status: body.status ?? DeviceStatus.Submitted
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
        const existingEntity = await this.deviceService.findOne(id);

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
        const existing = await this.deviceService.findOne(id);

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

    @Put('/:id/smartMeterReading')
    async addSmartMeterRead(@Param('id') id: string, @Body() newSmartMeterRead: ISmartMeterRead) {
        const existing = await this.deviceService.findOne(id);

        if (!existing) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        try {
            await this.deviceService.addSmartMeterReading(id, newSmartMeterRead);

            return {
                message: `Smart meter reading successfully added to device ${id}`
            };
        } catch (error) {
            throw new UnprocessableEntityException({
                message: `Smart meter reading could not be added due to an unknown error for device ${id}`
            });
        }
    }
}
