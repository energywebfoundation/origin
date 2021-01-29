import {
    IDevice,
    ILoggedInUser,
    ISmartMeterRead,
    ResponseSuccess,
    Role
} from '@energyweb/origin-backend-core';
import {
    ActiveOrganizationGuard,
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor,
    Roles,
    RolesGuard,
    UserDecorator
} from '@energyweb/origin-backend-utils';
import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpStatus,
    Logger,
    NotFoundException,
    Param,
    Post,
    Put,
    Query,
    UnauthorizedException,
    UnprocessableEntityException,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
    ApiBearerAuth,
    ApiBody,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiQuery,
    ApiResponse,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiUnprocessableEntityResponse
} from '@nestjs/swagger';
import { BigNumber } from 'ethers';

import { StorageErrors } from '../../enums/StorageErrors';
import { SuccessResponseDTO } from '../../utils/success-response.dto';
import { Device } from './device.entity';
import { DeviceService } from './device.service';
import { CreateDeviceDTO } from './dto/create-device.dto';
import { DeviceSettingsUpdateDTO } from './dto/device-settings-update.dto';
import { DeviceDTO } from './dto/device.dto';
import { SmartMeterReadDTO } from './dto/smart-meter-readings.dto';
import { UpdateDeviceStatusDTO } from './dto/update-device-status.dto';

@ApiTags('device')
@ApiBearerAuth('access-token')
@Controller('/Device')
@UseInterceptors(NullOrUndefinedResultInterceptor)
export class DeviceController {
    private readonly logger = new Logger(DeviceController.name);

    constructor(private readonly deviceService: DeviceService) {}

    @Get()
    @ApiQuery({
        name: 'withMeterStats',
        description: 'Whether or not to return smart meter stats with the device',
        required: false,
        type: Boolean
    })
    @ApiResponse({ status: HttpStatus.OK, type: [DeviceDTO], description: 'Returns all Devices' })
    async getAll(@Query('withMeterStats') withMeterStats?: boolean): Promise<DeviceDTO[]> {
        const devices = await this.deviceService.getAll(withMeterStats ?? false);

        return this.serializeDevices(devices, withMeterStats);
    }

    @Get('/my-devices')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.OrganizationUser)
    @ApiQuery({
        name: 'withMeterStats',
        description: 'Whether or not to return smart meter stats with the device',
        required: false,
        type: Boolean
    })
    @ApiResponse({ status: HttpStatus.OK, type: [DeviceDTO], description: 'Returns my Devices' })
    async getMyDevices(
        @UserDecorator() { organizationId }: ILoggedInUser,
        @Query('withMeterStats') withMeterStats?: boolean
    ): Promise<DeviceDTO[]> {
        const devices = await this.deviceService.getOrganizationDevices(
            organizationId,
            withMeterStats ?? false
        );

        return this.serializeDevices(devices, withMeterStats);
    }

    @Get('supplyBy')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.OrganizationUser)
    @ApiQuery({ name: 'facility', type: String, description: 'Name of the facility' })
    @ApiQuery({ name: 'status', type: String })
    @ApiResponse({ status: HttpStatus.OK, type: [DeviceDTO], description: 'Gets supply' })
    async getSupplyBy(
        @UserDecorator() { organizationId }: ILoggedInUser,
        @Query('facility') facilityName: string,
        @Query('status') status: string
    ): Promise<DeviceDTO[]> {
        const devices = await this.deviceService.getSupplyBy(
            organizationId,
            facilityName,
            Number.parseInt(status, 10)
        );

        return this.serializeDevices(devices);
    }

    @Get('/:id')
    @ApiQuery({
        name: 'withMeterStats',
        description: 'Whether or not to return smart meter stats with the device',
        required: false,
        type: Boolean
    })
    @ApiResponse({ status: HttpStatus.OK, type: DeviceDTO, description: 'Returns a Device' })
    @ApiNotFoundResponse({
        status: HttpStatus.NOT_FOUND,
        description: `The device with the ID doesn't exist`
    })
    async get(
        @Param('id') id: string,
        @Query('withMeterStats') withMeterStats?: boolean
    ): Promise<DeviceDTO> {
        const device = await this.deviceService.findOne(id, withMeterStats ?? false);

        if (!device) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        device.smartMeterReads = this.serializeSmartMeterReads(device.smartMeterReads);

        return this.serializeDevices([device], withMeterStats ?? false)[0];
    }

    @Post()
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard, ActiveOrganizationGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    @ApiBody({ type: CreateDeviceDTO })
    @ApiResponse({ status: HttpStatus.CREATED, type: DeviceDTO, description: 'Creates a Device' })
    @ApiForbiddenResponse({
        status: HttpStatus.FORBIDDEN,
        description: `User doesn't have the correct permissions`
    })
    @ApiUnprocessableEntityResponse({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        description: 'Incorrect inputs'
    })
    async createDevice(
        @Body() body: CreateDeviceDTO,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<DeviceDTO> {
        if (typeof loggedUser.organizationId === 'undefined') {
            throw new ForbiddenException('general.feedback.noOrganization');
        }

        const device = await this.deviceService.create(body, loggedUser);

        return this.serializeDevices([device]).pop();
    }

    @Delete('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Issuer, Role.Admin, Role.OrganizationAdmin)
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Deletes a Device'
    })
    @ApiNotFoundResponse({
        status: HttpStatus.NOT_FOUND,
        description: `The device with the ID doesn't exist`
    })
    @ApiUnauthorizedResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: `You are not the organization admin`
    })
    async delete(
        @Param('id') id: string,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<SuccessResponseDTO> {
        const device = await this.deviceService.findOne(id);

        if (!device) {
            throw new NotFoundException({
                success: false,
                message: StorageErrors.NON_EXISTENT
            });
        }

        if (
            loggedUser.organizationId !== device.organizationId &&
            !loggedUser.hasRole(Role.Issuer) &&
            !loggedUser.hasRole(Role.Admin)
        ) {
            throw new UnauthorizedException({
                success: false,
                message: 'You are not the organization admin.'
            });
        }

        await this.deviceService.remove(device as Device);

        return ResponseSuccess(`Entity ${id} deleted`);
    }

    @Put('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Issuer, Role.Admin)
    @ApiBody({ type: UpdateDeviceStatusDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: DeviceDTO,
        description: `Updates a device's status`
    })
    @ApiNotFoundResponse({ description: 'Non existent device', type: SuccessResponseDTO })
    async updateDeviceStatus(
        @Param('id') id: string,
        @Body() { status }: UpdateDeviceStatusDTO
    ): Promise<DeviceDTO> {
        const device = await this.deviceService.updateStatus(id, status);

        return this.serializeDevices([device]).pop();
    }

    @Put('/:id/settings')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.OrganizationUser)
    @ApiBody({ type: DeviceSettingsUpdateDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: `Updates device's settings`
    })
    @ApiUnprocessableEntityResponse({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        description: `Body is missing automaticPostForSale or defaultAskPrice`
    })
    async updateDeviceSettings(
        @Param('id') id: string,
        @Body() body: DeviceSettingsUpdateDTO,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<SuccessResponseDTO> {
        const device = await this.deviceService.findOne(id);

        if (loggedUser.organizationId !== device.organizationId) {
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
    @ApiResponse({
        status: HttpStatus.OK,
        type: [SmartMeterReadDTO],
        description: `Gets smart meter readings for a Device`
    })
    @ApiNotFoundResponse({
        status: HttpStatus.NOT_FOUND,
        description: `The device with the ID doesn't exist`
    })
    async getAllSmartMeterReadings(@Param('id') id: string): Promise<ISmartMeterRead[]> {
        const device = await this.deviceService.findOne(id);

        if (!device) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        const reads = await this.deviceService.getAllSmartMeterReadings(id);

        return this.serializeSmartMeterReads(reads);
    }

    @Get('/get-by-external-id/:type/:id')
    @ApiResponse({
        status: HttpStatus.OK,
        type: DeviceDTO,
        description: `Gets a Device by external device ID`
    })
    @ApiNotFoundResponse({
        status: HttpStatus.NOT_FOUND,
        description: `The device with the ID doesn't exist`
    })
    async getByExternalId(
        @Param('type') type: string,
        @Param('id') id: string
    ): Promise<DeviceDTO> {
        const existing = await this.deviceService.findByExternalId({ id, type });

        if (!existing) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        return this.serializeDevices([existing]).pop();
    }

    @Put('/:id/smartMeterReading')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Admin, Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    @ApiBody({ type: [SmartMeterReadDTO], required: true })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: `Adds smart meter readings to a Device`
    })
    @ApiNotFoundResponse({
        status: HttpStatus.NOT_FOUND,
        description: `The device with the ID doesn't exist`
    })
    @ApiUnauthorizedResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: `You are not the device manager`
    })
    async addSmartMeterReads(
        @Param('id') id: string,
        @UserDecorator() loggedUser: ILoggedInUser,
        @Body() newSmartMeterReads: SmartMeterReadDTO[]
    ): Promise<SuccessResponseDTO> {
        const device = await this.deviceService.findOne(id);

        if (!device) {
            throw new NotFoundException({
                success: false,
                message: StorageErrors.NON_EXISTENT
            });
        }

        if (
            loggedUser.organizationId !== device.organizationId &&
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

    private serializeDevices(devices: IDevice[], withMeterStats = false): DeviceDTO[] {
        return devices?.map((device) => ({
            ...device,
            smartMeterReads: this.serializeSmartMeterReads(device.smartMeterReads),
            ...(withMeterStats && {
                meterStats: {
                    certified: BigNumber.from(device.meterStats.certified).toString(),
                    uncertified: BigNumber.from(device.meterStats.uncertified).toString()
                }
            })
        }));
    }
}
