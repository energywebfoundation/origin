import {
    DeviceCreateData,
    DeviceSettingsUpdateData,
    DeviceUpdateData,
    IDeviceWithRelationsIds,
    ILoggedInUser,
    ISmartMeterRead,
    Role,
    ISuccessResponse
} from '@energyweb/origin-backend-core';
import { Roles, RolesGuard, UserDecorator, ActiveUserGuard } from '@energyweb/origin-backend-utils';
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
    UseGuards,
    UnauthorizedException
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
    async getAll(@Query('withMeterStats') withMeterStats: boolean) {
        return this.deviceService.getAll(withMeterStats ?? false);
    }

    @Get('/my-devices')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.OrganizationUser)
    async getMyDevices(
        @Query('withMeterStats') withMeterStats: boolean,
        @UserDecorator() { organizationId }: ILoggedInUser
    ) {
        return this.deviceService.getAll(withMeterStats ?? false, {
            where: { organization: { id: organizationId } }
        });
    }

    @Get('supplyBy')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
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
    async get(
        @Param('id') id: string,
        @Query('withMeterStats') withMeterStats: boolean
    ): Promise<IDeviceWithRelationsIds> {
        const existingEntity = await this.deviceService.findOne(id, {}, withMeterStats);

        if (!existingEntity) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        return existingEntity;
    }

    @Post()
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    async post(@Body() body: DeviceCreateData, @UserDecorator() loggedUser: ILoggedInUser) {
        if (typeof loggedUser.organizationId === 'undefined') {
            throw new BadRequestException('server.errors.loggedUserOrganizationEmpty');
        }

        return this.deviceService.create(body, loggedUser);
    }

    @Delete('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Issuer, Role.Admin, Role.OrganizationAdmin)
    async delete(
        @Param('id') id: string,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<ISuccessResponse> {
        const device = await this.deviceService.findOne(id);

        if (!device) {
            throw new NotFoundException({
                success: false,
                message: StorageErrors.NON_EXISTENT
            });
        }

        if (loggedUser.hasRole(Role.OrganizationAdmin)) {
            if (loggedUser.organizationId !== device.organization) {
                throw new UnauthorizedException({
                    success: false,
                    message: 'You are not the organization admin.'
                });
            }
        }

        await this.deviceService.remove(device);

        return {
            success: true,
            message: `Entity ${id} deleted`
        };
    }

    @Put('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Issuer, Role.Admin)
    async updateDeviceStatus(
        @Param('id') id: string,
        @Body() body: DeviceUpdateData
    ): Promise<ExtendedBaseEntity & IDeviceWithRelationsIds> {
        const res = await this.deviceService.updateStatus(id, body);
        return res;
    }

    @Put('/:id/settings')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
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

    @Put('/:id/smartMeterReading')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    async addSmartMeterRead(
        @Param('id') id: string,
        @UserDecorator() { organizationId }: ILoggedInUser,
        @Body() newSmartMeterRead: ISmartMeterRead
    ): Promise<ISuccessResponse> {
        const device = await this.deviceService.findOne(id);

        if (!device) {
            throw new NotFoundException({
                success: false,
                message: StorageErrors.NON_EXISTENT
            });
        }

        if (device.organization !== organizationId) {
            throw new UnauthorizedException({
                success: false,
                message: 'You are not the device manager.'
            });
        }

        try {
            return this.deviceService.addSmartMeterReading(id, newSmartMeterRead);
        } catch (error) {
            this.logger.error('Error when saving smart meter read');
            this.logger.error({
                error,
                id,
                newSmartMeterRead
            });
            throw new UnprocessableEntityException({
                success: false,
                message: `Smart meter reading could not be added due to an unknown error for device ${id}`
            });
        }
    }
}
