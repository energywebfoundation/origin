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
    ConflictException,
    Controller,
    Delete,
    Get,
    HttpStatus,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from '@nestjs/swagger';

import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { DeviceAlreadyUsedError } from './errors/device-already-used.error';
import { Supply } from './supply.entity';
import { SupplyService } from './supply.service';

@Controller('supply')
@UseInterceptors(ClassSerializerInterceptor, NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export class SupplyController {
    constructor(private readonly supplyService: SupplyService) {}

    @Post()
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @ApiResponse({ status: HttpStatus.OK, type: [Supply], description: 'Returns device supply id' })
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    public async create(
        @UserDecorator() { ownerId }: ILoggedInUser,
        @Body() createSupplyDto: CreateSupplyDto
    ): Promise<Supply> {
        try {
            const supply = await this.supplyService.create(ownerId, createSupplyDto);
            return supply;
        } catch (error) {
            if (error instanceof DeviceAlreadyUsedError) {
                throw new ConflictException({ message: error.message });
            }
            throw error;
        }
    }

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: [Supply],
        description: 'Returns all device supply settings'
    })
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    public findAll(@UserDecorator() { ownerId }: ILoggedInUser): Promise<Supply[]> {
        return this.supplyService.findAll(ownerId);
    }

    @Get(':id')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: [Supply],
        description: 'Returns device supply settings'
    })
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    public findOne(
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
        @UserDecorator() { ownerId }: ILoggedInUser
    ): Promise<Supply> {
        return this.supplyService.findOne(ownerId, id);
    }

    @Put(':id')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: [Supply],
        description: 'Returns device supply settings'
    })
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    update(
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
        @UserDecorator() { ownerId }: ILoggedInUser,
        @Body() updateSupplyDto: UpdateSupplyDto
    ): Promise<Supply> {
        return this.supplyService.update(ownerId, id, updateSupplyDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    @ApiResponse({
        status: HttpStatus.OK
    })
    public async remove(
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
        @UserDecorator() { ownerId }: ILoggedInUser
    ): Promise<void> {
        const result = await this.supplyService.remove(ownerId, id);

        if (!result) {
            throw new NotFoundException();
        }
    }
}
