import { IOriginConfiguration, Role } from '@energyweb/origin-backend-core';
import {
    Roles,
    RolesGuard,
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor
} from '@energyweb/origin-backend-utils';
import { Body, Controller, Get, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ConfigurationService } from './configuration.service';

@Controller('configuration')
@UseInterceptors(NullOrUndefinedResultInterceptor)
export class ConfigurationController {
    constructor(private readonly configurationService: ConfigurationService) {}

    @Get()
    async get() {
        return this.configurationService.get();
    }

    @Put()
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Admin)
    async put(@Body() body: IOriginConfiguration) {
        const configuration = await this.configurationService.update(body);

        return {
            message: `Configuration ${configuration.id} updated`
        };
    }
}
