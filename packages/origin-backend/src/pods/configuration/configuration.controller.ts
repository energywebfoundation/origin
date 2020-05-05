import { Controller, Get, Body, Put } from '@nestjs/common';
import { IOriginConfiguration } from '@energyweb/origin-backend-core';

import { ConfigurationService } from './configuration.service';

@Controller('configuration')
export class ConfigurationController {
    constructor(private readonly configurationService: ConfigurationService) {}

    @Get()
    async get() {
        return this.configurationService.get();
    }

    // TODO: remove
    @Put()
    async put(@Body() body: IOriginConfiguration) {
        const configuration = await this.configurationService.update(body);

        return {
            message: `Configuration ${configuration.id} updated`
        };
    }
}
