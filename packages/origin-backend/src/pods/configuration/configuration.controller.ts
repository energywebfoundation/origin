import {
    IOriginConfiguration,
    ISuccessResponse,
    ResponseSuccess,
    Role
} from '@energyweb/origin-backend-core';
import {
    Roles,
    RolesGuard,
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor
} from '@energyweb/origin-backend-utils';
import { Body, Controller, Get, HttpStatus, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ConfigurationDTO } from './configuration.dto';
import { ConfigurationService } from './configuration.service';

@ApiTags('configuration')
@ApiBearerAuth('access-token')
@Controller('configuration')
@UseInterceptors(NullOrUndefinedResultInterceptor)
export class ConfigurationController {
    constructor(private readonly configurationService: ConfigurationService) {}

    @Get()
    @ApiResponse({
        status: HttpStatus.OK,
        type: ConfigurationDTO,
        description: 'Returns the Configuration'
    })
    async get(): Promise<ConfigurationDTO> {
        return this.configurationService.get();
    }

    @Put()
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Admin)
    @ApiBody({ type: ConfigurationDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: ConfigurationDTO,
        description: 'Updates the Configuration'
    })
    async update(@Body() body: IOriginConfiguration): Promise<ISuccessResponse> {
        const configuration = await this.configurationService.update(body);

        return ResponseSuccess(`Configuration ${configuration.id} updated`);
    }
}
