import { Repository } from 'typeorm';
import {
    DeviceStatus,
    DeviceUpdateData,
    SupportedEvents,
    DeviceStatusChanged,
    ISmartMeterRead,
    IUserWithRelationsIds,
    IDeviceWithRelationsIds,
    DeviceCreateData
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
    Inject,
    UseGuards
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthGuard } from '@nestjs/passport';
import { EventsWebSocketGateway } from '../../events/events.gateway';

import { Device } from './device.entity';
import { StorageErrors } from '../../enums/StorageErrors';
import { DeviceService } from './device.service';
import { UserDecorator } from '../user/user.decorator';

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
    async get(@Param('id') id: string): Promise<IDeviceWithRelationsIds> {
        const existingEntity = await this.deviceService.findOne(id);

        if (!existingEntity) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        return existingEntity;
    }

    @Post()
    @UseGuards(AuthGuard())
    async post(@Body() body: DeviceCreateData, @UserDecorator() loggedUser: IUserWithRelationsIds) {
        if (typeof loggedUser.organization === 'undefined') {
            throw new BadRequestException('server.errors.loggedUserOrganizationEmpty');
        }

        return this.deviceService.create({
            ...body,
            status: body.status ?? DeviceStatus.Submitted,
            lastSmartMeterReading: body.lastSmartMeterReading ?? null,
            smartMeterReads: body.smartMeterReads ?? [],
            deviceGroup: body.deviceGroup ?? '',
            organization: loggedUser.organization
        });
    }

    @Delete('/:id')
    async delete(@Param('id') id: string) {
        const existingEntity = await this.deviceService.findOne(id);

        if (!existingEntity) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        await this.deviceService.remove(existingEntity);

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

    @Get('/:id/smartMeterReading')
    async getAllSmartMeterReadings(@Param('id') id: string) {
        const existing = await this.deviceService.findOne(id);

        if (!existing) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        return this.deviceService.getAllSmartMeterReadings(id);
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
