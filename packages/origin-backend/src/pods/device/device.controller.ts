import {
    DeviceCreateData,
    DeviceSettingsUpdateData,
    DeviceUpdateData,
    IDevice,
    ILoggedInUser,
    ISmartMeterRead,
    ISuccessResponse,
    OrganizationStatus,
    Role
} from '@energyweb/origin-backend-core';
import { ActiveUserGuard, Roles, RolesGuard, UserDecorator } from '@energyweb/origin-backend-utils';
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
    UnauthorizedException,
    UnprocessableEntityException,
    UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BigNumber } from 'ethers';

import { StorageErrors } from '../../enums/StorageErrors';
import { Organization } from '../organization/organization.entity';
import { OrganizationService } from '../organization/organization.service';
import { PublicOrganizationInfoDTO } from '../organization/public-organization-info.dto';
import { Device } from './device.entity';
import { DeviceService } from './device.service';

@Controller('/Device')
export class DeviceController {
    private readonly logger = new Logger(DeviceController.name);

    constructor(
        private readonly deviceService: DeviceService,
        private readonly organizationService: OrganizationService
    ) {}

    @Get()
    async getAll(@Query('withMeterStats') withMeterStats: boolean): Promise<IDevice[]> {
        const devices = await this.deviceService.getAll(withMeterStats ?? false);

        return this.serializeDevices(devices, withMeterStats);
    }

    @Get('/my-devices')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.OrganizationUser)
    async getMyDevices(
        @Query('withMeterStats') withMeterStats: boolean,
        @UserDecorator() { organizationId }: ILoggedInUser
    ): Promise<IDevice[]> {
        const devices = await this.deviceService.getOrganizationDevices(
            organizationId,
            withMeterStats ?? false
        );

        return this.serializeDevices(devices, withMeterStats);
    }

    @Get('supplyBy')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.OrganizationUser)
    async getSupplyBy(
        @UserDecorator() { organizationId }: ILoggedInUser,
        @Query('facility') facilityName: string,
        @Query('status') status: string
    ): Promise<IDevice[]> {
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
        @Query('withMeterStats') withMeterStats: boolean
    ): Promise<IDevice> {
        const device = await this.deviceService.findOne(id, withMeterStats);

        if (!device) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        device.smartMeterReads = this.serializeSmartMeterReads(device.smartMeterReads);

        return this.serializeDevices([device], withMeterStats)[0];
    }

    @Post()
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    async createDevice(
        @Body() body: DeviceCreateData,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<IDevice> {
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
        const device = await this.deviceService.findOne(id);

        if (!device) {
            throw new NotFoundException({
                success: false,
                message: StorageErrors.NON_EXISTENT
            });
        }

        if (
            loggedUser.organizationId !== device.organization.id &&
            !loggedUser.hasRole(Role.Issuer) &&
            !loggedUser.hasRole(Role.Admin)
        ) {
            throw new UnauthorizedException({
                success: false,
                message: 'You are not the organization admin.'
            });
        }

        await this.deviceService.remove(device as Device);

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
    ): Promise<IDevice> {
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
    async getByExternalId(@Param('type') type: string, @Param('id') id: string): Promise<IDevice> {
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
            loggedUser.organizationId !== device.organization.id &&
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
        return reads?.map(({ timestamp, meterReading }) => ({
            timestamp,
            meterReading: BigNumber.from(meterReading).toString()
        }));
    }

    private serializeDevices(devices: IDevice[], withMeterStats = false) {
        return devices?.map((device) => ({
            ...device,
            smartMeterReads: this.serializeSmartMeterReads(device.smartMeterReads),
            ...(withMeterStats && {
                meterStats: {
                    certified: BigNumber.from(device.meterStats.certified).toString(),
                    uncertified: BigNumber.from(device.meterStats.uncertified).toString()
                }
            }),
            organization: PublicOrganizationInfoDTO.fromPlatformOrganization(
                device.organization as Organization
            )
        }));
    }
}
