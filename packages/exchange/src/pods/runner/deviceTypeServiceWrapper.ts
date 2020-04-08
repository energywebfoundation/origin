import { ConfigurationService } from '@energyweb/origin-backend';
import { DeviceTypeService, IDeviceTypeService } from '@energyweb/utils-general';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class DeviceTypeServiceWrapper implements OnModuleInit {
    private _deviceTypeService: IDeviceTypeService;

    constructor(private readonly moduleRef: ModuleRef) {}

    public async onModuleInit() {
        const configService = this.moduleRef.get(ConfigurationService, {
            strict: false
        });

        const { deviceTypes } = await configService.get();

        this._deviceTypeService = new DeviceTypeService(deviceTypes);
    }

    public get deviceTypeService() {
        return this._deviceTypeService;
    }
}
