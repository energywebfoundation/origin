import { ILoggedInUser, Role } from '@energyweb/origin-backend-core';
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
    ClassSerializerInterceptor,
    Controller,
    Get,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
    Put,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiResponse,
    ApiTags,
    ApiUnprocessableEntityResponse
} from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';

import { SuccessResponseDTO } from '../utils/success-response.dto';
import { DeviceService } from './device.service';
import {
    CodeNameDTO,
    CreateDeviceDTO,
    DeviceDTO,
    ImportIrecDeviceDTO,
    IrecDeviceDTO,
    PublicDeviceDTO,
    UpdateDeviceDTO
} from './dto';

@ApiTags('device')
@ApiBearerAuth('access-token')
@Controller('/irec/device-registry')
@UseInterceptors(NullOrUndefinedResultInterceptor, ClassSerializerInterceptor)
@UsePipes(ValidationPipe)
export class DeviceController {
    constructor(private readonly deviceService: DeviceService) {}

    @Get()
    @ApiResponse({
        status: HttpStatus.OK,
        type: [PublicDeviceDTO],
        description: 'Returns all Devices'
    })
    async getAll(): Promise<PublicDeviceDTO[]> {
        const devices = await this.deviceService.findAll();

        return devices?.map((device) =>
            plainToClass(PublicDeviceDTO, device, { excludeExtraneousValues: true })
        );
    }

    @Get('/device-type')
    @ApiResponse({
        status: HttpStatus.OK,
        type: [CodeNameDTO],
        description: 'Returns all IREC device types'
    })
    getDeviceTypes(): CodeNameDTO[] {
        const deviceTypes = this.deviceService.getDeviceTypes();

        return deviceTypes.map((deviceType) => plainToClass(CodeNameDTO, deviceType));
    }

    @Get('/fuel-type')
    @ApiResponse({
        status: HttpStatus.OK,
        type: [CodeNameDTO],
        description: 'Returns all IREC fuel types'
    })
    getFuelTypes(): CodeNameDTO[] {
        const fuelTypes = this.deviceService.getFuelTypes();

        return fuelTypes.map((fuelType) => plainToClass(CodeNameDTO, fuelType));
    }

    @Get('/device/:id')
    @ApiResponse({ status: HttpStatus.OK, type: PublicDeviceDTO, description: 'Returns a Device' })
    @ApiNotFoundResponse({
        status: HttpStatus.NOT_FOUND,
        description: `The device with the ID doesn't exist`
    })
    async get(@Param('id') id: string): Promise<PublicDeviceDTO> {
        const device = await this.deviceService.findOne(id);

        if (!device) {
            throw new NotFoundException();
        }

        return plainToClass(PublicDeviceDTO, device, { excludeExtraneousValues: true });
    }

    @Get('/my-devices')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.OrganizationUser)
    @ApiResponse({ status: HttpStatus.OK, type: [DeviceDTO], description: 'Returns my Devices' })
    async getMyDevices(@UserDecorator() { ownerId }: ILoggedInUser): Promise<DeviceDTO[]> {
        const devices = await this.deviceService.findAll({ where: { ownerId } });

        return devices?.map((device) => plainToClass(DeviceDTO, device));
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
    @ApiBadRequestResponse({ status: HttpStatus.BAD_REQUEST })
    async createDevice(
        @Body() newDevice: CreateDeviceDTO,
        @UserDecorator() loggedInUser: ILoggedInUser
    ): Promise<DeviceDTO> {
        const device = await this.deviceService.create(loggedInUser, newDevice);

        return plainToClass(DeviceDTO, device);
    }

    @Put('/device/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    @ApiBody({ type: UpdateDeviceDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: DeviceDTO,
        description: `Updates a device data`
    })
    @ApiNotFoundResponse({ description: 'Non existent device', type: SuccessResponseDTO })
    async updateDevice(
        @Param('id') id: string,
        @Body() deviceData: UpdateDeviceDTO,
        @UserDecorator() loggedInUser: ILoggedInUser
    ): Promise<DeviceDTO> {
        const device = await this.deviceService.findOne(id);
        if (device.ownerId !== loggedInUser.ownerId) {
            throw new NotFoundException('Device not found');
        }

        const updatedDevice = await this.deviceService.update(loggedInUser, id, deviceData);

        return plainToClass(DeviceDTO, updatedDevice);
    }

    @Get('/irec-devices-to-import')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.OrganizationUser)
    @ApiResponse({
        status: HttpStatus.OK,
        type: [IrecDeviceDTO],
        description: 'Returns not imported IREC devices'
    })
    async getDevicesToImportFromIrec(
        @UserDecorator() loggedInUser: ILoggedInUser
    ): Promise<IrecDeviceDTO[]> {
        return this.deviceService.getDevicesToImport(loggedInUser);
    }

    @Post('/import-irec-device')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard, ActiveOrganizationGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    @ApiBody({ type: ImportIrecDeviceDTO })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: DeviceDTO,
        description: 'Imports a device from IREC'
    })
    @ApiForbiddenResponse({
        status: HttpStatus.FORBIDDEN,
        description: `User doesn't have the correct permissions`
    })
    @ApiUnprocessableEntityResponse({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        description: 'Incorrect inputs'
    })
    @ApiBadRequestResponse({ status: HttpStatus.BAD_REQUEST })
    async importIrecDevice(
        @Body() deviceToImport: ImportIrecDeviceDTO,
        @UserDecorator() loggedInUser: ILoggedInUser
    ): Promise<DeviceDTO> {
        const device = await this.deviceService.importIrecDevice(loggedInUser, deviceToImport);

        return plainToClass(DeviceDTO, device);
    }
}
