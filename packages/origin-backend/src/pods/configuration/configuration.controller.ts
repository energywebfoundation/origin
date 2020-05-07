import { IOriginConfiguration, Role, Roles, RolesGuard } from '@energyweb/origin-backend-core';
import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ConfigurationService } from './configuration.service';

@Controller('configuration')
export class ConfigurationController {
    constructor(private readonly configurationService: ConfigurationService) {}

    @Get()
    async get() {
        return this.configurationService.get();
    }

    @Put()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.Admin)
    async put(@Body() body: IOriginConfiguration) {
        const configuration = await this.configurationService.update(body);

        return {
            message: `Configuration ${configuration.id} updated`
        };
    }
}
