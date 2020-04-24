import {
    DeviceCreateData,
    DeviceStatus,
    DeviceUpdateData,
    IDeviceWithRelationsIds,
    ISmartMeterRead,
    IUserWithRelationsIds
} from '@energyweb/origin-backend-core';
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    NotFoundException,
    Param,
    Post,
    Put,
    UnprocessableEntityException,
    UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { StorageErrors } from '../../enums/StorageErrors';
import { NotificationService } from '../notification';
import { OrganizationService } from '../organization';
import { UserDecorator } from '../user/user.decorator';
import { DeviceService } from './device.service';

@Controller('/Device')
export class DeviceController {
    private readonly logger = new Logger(DeviceController.name);

    constructor(
        private readonly deviceService: DeviceService,
        private readonly organizationService: OrganizationService,
        private readonly notificationService: NotificationService
    ) {}

    @Get()
    async getAll() {
        return this.deviceService.getAll();
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
        const res = await this.deviceService.update(id, body);
        return res;
    }

    @Get('/:id/smartMeterReading')
    async getAllSmartMeterReadings(@Param('id') id: string) {
        const existing = await this.deviceService.findOne(id);

        if (!existing) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        return this.deviceService.getAllSmartMeterReadings(id);
    }

    @Get('/get-by-external-id/:type/:id')
    async getByExternalId(@Param('type') type: string, @Param('id') id: string) {
        const existing = await this.deviceService.findByExternalId({ id, type });

        if (!existing) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        return existing;
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
            this.logger.error('Errow when saving smart meter read');
            this.logger.error(error);
            throw new UnprocessableEntityException({
                message: `Smart meter reading could not be added due to an unknown error for device ${id}`
            });
        }
    }
}
