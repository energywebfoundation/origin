import {
    DeviceCreateData,
    DeviceSettingsUpdateData,
    DeviceUpdateData,
    IDeviceWithRelationsIds,
    ILoggedInUser,
    ISmartMeterRead,
    Role
} from '@energyweb/origin-backend-core';
import { Roles, RolesGuard, UserDecorator } from '@energyweb/origin-backend-utils';
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Logger,
    NotFoundException,
    Param,
    Post,
    Put,
    Query,
    UnprocessableEntityException,
    UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StorageErrors } from '../../enums/StorageErrors';
import { ExtendedBaseEntity } from '../ExtendedBaseEntity';
import { OrganizationService } from '../organization/organization.service';
import { DeviceService } from './device.service';

@Controller('/Device')
export class DeviceController {
    private readonly logger = new Logger(DeviceController.name);

    constructor(
        private readonly deviceService: DeviceService,
        private readonly organizationService: OrganizationService
    ) {}

    // TODO: remove sensitive information

    @Get()
    async getAll() {
        return this.deviceService.getAll();
    }

    @Get('/my-devices')
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.OrganizationUser)
    async getMyDevices(@UserDecorator() { organizationId }: ILoggedInUser) {
        return this.deviceService.getAll({ where: { organization: { id: organizationId } } });
    }

    @Get('supplyBy')
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.OrganizationUser)
    async getSupplyBy(
        @UserDecorator() { organizationId }: ILoggedInUser,
        @Query('facility') facilityName: string,
        @Query('status') status: string
    ) {
        return this.deviceService.getSupplyBy(
            organizationId,
            facilityName,
            Number.parseInt(status, 10)
        );
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
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    async post(@Body() body: DeviceCreateData, @UserDecorator() loggedUser: ILoggedInUser) {
        if (typeof loggedUser.organizationId === 'undefined') {
            throw new BadRequestException('server.errors.loggedUserOrganizationEmpty');
        }

        return this.deviceService.create(body, loggedUser);
    }

    @Delete('/:id')
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager)
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
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.Issuer)
    async put(
        @Param('id') id: string,
        @Body() body: DeviceUpdateData
    ): Promise<ExtendedBaseEntity & IDeviceWithRelationsIds> {
        const res = await this.deviceService.update(id, body);
        return res;
    }

    @Put('/:id/settings')
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.OrganizationUser)
    async updateDeviceSettings(
        @Param('id') id: string,
        @Body() body: DeviceSettingsUpdateData,
        @UserDecorator() loggedUser: ILoggedInUser
    ) {
        if (!this.organizationService.hasDevice(loggedUser.organizationId, id)) {
            throw new ForbiddenException();
        }

        if (
            body?.automaticPostForSale === undefined ||
            (body?.automaticPostForSale &&
                (!Number.isInteger(body?.defaultAskPrice) || body?.defaultAskPrice === 0))
        ) {
            throw new UnprocessableEntityException(
                'Body is missing automaticPostForSale or defaultAskPrice'
            );
        }

        const res = await this.deviceService.updateSettings(id, body);
        return res;
    }

    @Get('/:id/smartMeterReading')
    async getAllSmartMeterReadings(@Param('id') id: string): Promise<ISmartMeterRead[]> {
        const device = await this.deviceService.findOne(id);

        if (!device) {
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

    // TODO: who can store smart meter readings for device?

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
            this.logger.error('Error when saving smart meter read');
            this.logger.error({
                error,
                id,
                newSmartMeterRead
            });
            throw new UnprocessableEntityException({
                message: `Smart meter reading could not be added due to an unknown error for device ${id}`
            });
        }
    }
}
