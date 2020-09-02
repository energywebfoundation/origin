import {
    DeviceCreateData,
    DeviceSettingsUpdateData,
    DeviceUpdateData,
    IDeviceWithRelationsIds,
    ILoggedInUser,
    ISmartMeterRead,
    Role,
    ISuccessResponse,
    IDevice,
    OrganizationStatus
} from '@energyweb/origin-backend-core';
import { Roles, RolesGuard, UserDecorator, ActiveUserGuard } from '@energyweb/origin-backend-utils';
import {
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
    async getAll(
        @Query('withMeterStats') withMeterStats: boolean,
        @Query('loadRelationIds') loadRelationIds: string | boolean = true
    ) {
        const devices = await this.deviceService.getAll(withMeterStats ?? false, {
            relations: ['organization'],
            loadRelationIds: loadRelationIds === 'true' || loadRelationIds === true
        });

        return this.serializeDevices(devices);
    }

    @Get('/my-devices')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.OrganizationUser)
    async getMyDevices(
        @Query('withMeterStats') withMeterStats: boolean,
        @UserDecorator() { organizationId }: ILoggedInUser
    ) {
        const devices = await this.deviceService.getAll(withMeterStats ?? false, {
            where: { organization: { id: organizationId } }
        });

        return this.serializeDevices(devices);
    }

    @Get('supplyBy')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.OrganizationUser)
    async getSupplyBy(
        @UserDecorator() { organizationId }: ILoggedInUser,
        @Query('facility') facilityName: string,
        @Query('status') status: string
    ) {
        const devices = await this.deviceService.getSupplyBy(
            organizationId,
            facilityName,
            Number.parseInt(status, 10)
        );

        return this.serializeDevices(devices);
    }

    @Get('/:id')
    async get(
        @Param('id') id: string,
        @Query('withMeterStats') withMeterStats: boolean,
        @Query('loadRelationIds') loadRelationIds: string | boolean = true
    ): Promise<ExtendedBaseEntity & IDevice> {
        const existingEntity = await this.deviceService.findOne(
            id,
            {
                relations: ['organization'],
                loadRelationIds: loadRelationIds === 'true' || loadRelationIds === true
            },
            withMeterStats
        );

        if (!existingEntity) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        existingEntity.smartMeterReads = this.serializeSmartMeterReads(
            existingEntity.smartMeterReads
        );

        return existingEntity;
    }

    @Post()
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    async createDevice(@Body() body: DeviceCreateData, @UserDecorator() loggedUser: ILoggedInUser) {
        if (typeof loggedUser.organizationId === 'undefined') {
            throw new ForbiddenException('general.feedback.noOrganization');
        }

        const organization = await this.organizationService.findOne(loggedUser.organizationId);
        if (organization.status !== OrganizationStatus.Active) {
            throw new ForbiddenException('general.feedback.userHasToBePartOfApprovedOrganization');
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
        const device = (await this.deviceService.findOne(id)) as ExtendedBaseEntity &
            IDeviceWithRelationsIds;

        if (!device) {
            throw new NotFoundException({
                success: false,
                message: StorageErrors.NON_EXISTENT
            });
        }

        if (
            loggedUser.organizationId !== device.organization &&
            !loggedUser.hasRole(Role.Issuer) &&
            !loggedUser.hasRole(Role.Admin)
        ) {
            throw new UnauthorizedException({
                success: false,
                message: 'You are not the organization admin.'
            });
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
        return this.deviceService.updateStatus(id, body);
    }

    @Put('/:id/settings')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.OrganizationUser)
    async updateDeviceSettings(
        @Param('id') id: string,
        @Body() body: DeviceSettingsUpdateData,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<ISuccessResponse> {
        if (!this.organizationService.hasDevice(loggedUser.organizationId, id)) {
            throw new ForbiddenException();
        }

        if (
            body?.automaticPostForSale === undefined ||
            (body?.automaticPostForSale &&
                (!Number.isInteger(body?.defaultAskPrice) || body?.defaultAskPrice === 0))
        ) {
            throw new UnprocessableEntityException({
                success: false,
                message: 'Body is missing automaticPostForSale or defaultAskPrice'
            });
        }

        return this.deviceService.updateSettings(id, body);
    }

    @Get('/:id/smartMeterReading')
    async getAllSmartMeterReadings(@Param('id') id: string): Promise<ISmartMeterRead[]> {
        const device = await this.deviceService.findOne(id);

        if (!device) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        const reads = await this.deviceService.getAllSmartMeterReadings(id);

        return this.serializeSmartMeterReads(reads);
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
    @Roles(Role.Admin, Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    async addSmartMeterReads(
        @Param('id') id: string,
        @UserDecorator() loggedUser: ILoggedInUser,
        @Body() newSmartMeterReads: ISmartMeterRead[]
    ): Promise<ISuccessResponse> {
        const device = await this.deviceService.findOne(id);

        if (!device) {
            throw new NotFoundException({
                success: false,
                message: StorageErrors.NON_EXISTENT
            });
        }

        if (
            loggedUser.organizationId !== device.organization &&
            !loggedUser.hasRole(Role.Admin, Role.SupportAgent)
        ) {
            throw new UnauthorizedException({
                success: false,
                message: 'You are not the device manager.'
            });
        }

        try {
            return this.deviceService.addSmartMeterReadings(id, newSmartMeterReads);
        } catch (error) {
            this.logger.error('Error when saving smart meter read');
            this.logger.error({
                error,
                id,
                newSmartMeterReads
            });
            throw new UnprocessableEntityException({
                success: false,
                message: `Smart meter reading could not be added due to an unknown error for device ${id}`
            });
        }
    }

    private serializeSmartMeterReads(reads: ISmartMeterRead[]) {
        return reads?.map((r) => ({ ...r, meterReading: r.meterReading.toString() }));
    }

    private serializeDevices(devices: IDevice[]) {
        return devices?.map((device) => ({
            ...device,
            smartMeterReads: this.serializeSmartMeterReads(device.smartMeterReads)
        }));
    }
}
