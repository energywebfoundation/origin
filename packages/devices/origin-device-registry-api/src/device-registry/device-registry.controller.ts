import { ILoggedInUser, Role } from '@energyweb/origin-backend-core';
import {
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
    Param,
    Post,
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
import { DeviceRegistryService } from './device-registry.service';
import { OriginDeviceDTO } from './dto/origin-device.dto';
import { NewDeviceDTO } from './dto/new-device.dto';

@ApiTags('device')
@ApiBearerAuth('access-token')
@Controller('/device-registry')
@UseInterceptors(NullOrUndefinedResultInterceptor, ClassSerializerInterceptor)
@UsePipes(ValidationPipe)
export class DeviceRegistryController {
    constructor(private readonly deviceRegistryService: DeviceRegistryService) {}

    @Get()
    @ApiResponse({
        status: HttpStatus.OK,
        type: [OriginDeviceDTO],
        description: 'Returns all Devices'
    })
    async getAll(): Promise<OriginDeviceDTO[]> {
        return this.deviceRegistryService.find();
    }

    @Get('/my-devices')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.OrganizationUser)
    @ApiResponse({
        status: HttpStatus.OK,
        type: [OriginDeviceDTO],
        description: 'Returns my Devices'
    })
    async getMyDevices(@UserDecorator() { ownerId }: ILoggedInUser): Promise<OriginDeviceDTO[]> {
        return this.deviceRegistryService.find({ where: { ownerId } });
    }

    @Get('/:id')
    @ApiResponse({ status: HttpStatus.OK, type: OriginDeviceDTO, description: 'Returns a Device' })
    @ApiNotFoundResponse({
        status: HttpStatus.NOT_FOUND,
        description: `The device with the ID doesn't exist`
    })
    async get(@Param('id') id: string): Promise<OriginDeviceDTO> {
        return this.deviceRegistryService.findOne(id);
    }

    @Post()
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    @ApiBody({ type: NewDeviceDTO })
    @ApiResponse({ status: HttpStatus.CREATED, type: String, description: 'Creates a Device' })
    @ApiForbiddenResponse({
        status: HttpStatus.FORBIDDEN,
        description: `User doesn't have the correct permissions`
    })
    @ApiUnprocessableEntityResponse({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        description: 'Incorrect inputs'
    })
    async createDevice(
        @Body() newDevice: NewDeviceDTO,
        @UserDecorator() loggedInUser: ILoggedInUser
    ): Promise<string> {
        return this.deviceRegistryService.register(loggedInUser, newDevice);
    }
}
