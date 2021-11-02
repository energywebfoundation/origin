import { IExchangeConfigurationService } from '@energyweb/exchange';
import { DeviceTypeService, IDeviceTypeService } from '@energyweb/utils-general';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class DeviceTypeServiceWrapper implements OnModuleInit {
    private _deviceTypeService: IDeviceTypeService;

    constructor(private readonly moduleRef: ModuleRef) {}

    public async onModuleInit() {
        await this.initDeviceTypeService();
    }

    private async initDeviceTypeService() {
        if (this._deviceTypeService) {
            return;
        }

        const configService = this.moduleRef.get<IExchangeConfigurationService>(
            IExchangeConfigurationService,
            {
                strict: false
            }
        );

        const deviceTypes = await configService.getDeviceTypes();

        this._deviceTypeService = new DeviceTypeService(deviceTypes);
    }

    public async getDeviceTypeService() {
        if (!this._deviceTypeService) {
            await this.initDeviceTypeService();
        }

        return this._deviceTypeService;
    }
}
