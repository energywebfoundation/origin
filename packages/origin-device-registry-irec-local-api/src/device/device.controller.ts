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
import { CreateDeviceDTO, DeviceDTO, UpdateDeviceStatusDTO } from './dto';

@ApiTags('device')
@ApiBearerAuth('access-token')
@Controller('/irec/device-registry')
@UseInterceptors(NullOrUndefinedResultInterceptor, ClassSerializerInterceptor)
@UsePipes(ValidationPipe)
export class DeviceController {
    constructor(private readonly deviceService: DeviceService) {}

    @Get()
    @ApiResponse({ status: HttpStatus.OK, type: [DeviceDTO], description: 'Returns all Devices' })
    async getAll(): Promise<DeviceDTO[]> {
        const devices = await this.deviceService.findAll();

        return devices?.map((device) => plainToClass(DeviceDTO, device));
    }

    @Get('/my-devices')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.OrganizationUser)
    @ApiResponse({ status: HttpStatus.OK, type: [DeviceDTO], description: 'Returns my Devices' })
    async getMyDevices(@UserDecorator() { ownerId }: ILoggedInUser): Promise<DeviceDTO[]> {
        const devices = await this.deviceService.findAll({ where: { ownerId } });

        return devices?.map((device) => plainToClass(DeviceDTO, device));
    }

    @Get('/:id')
    @ApiResponse({ status: HttpStatus.OK, type: DeviceDTO, description: 'Returns a Device' })
    @ApiNotFoundResponse({
        status: HttpStatus.NOT_FOUND,
        description: `The device with the ID doesn't exist`
    })
    async get(@Param('id') id: string): Promise<DeviceDTO> {
        const device = await this.deviceService.findOne(id);

        if (!device) {
            throw new NotFoundException();
        }

        return plainToClass(DeviceDTO, device);
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
        @Body() newDevice: CreateDeviceDTO,
        @UserDecorator() loggedInUser: ILoggedInUser
    ): Promise<DeviceDTO> {
        const device = await this.deviceService.create(loggedInUser, newDevice);

        return plainToClass(DeviceDTO, device);
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

        return plainToClass(DeviceDTO, device);
    }
}
