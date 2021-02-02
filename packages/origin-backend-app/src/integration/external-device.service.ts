import { IDeviceSettings, IExternalDeviceService, IProductInfo } from '@energyweb/exchange';
import { IDeviceService } from '@energyweb/origin-backend';
import { IExternalDeviceId } from '@energyweb/origin-backend-core';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class ExternalDeviceService implements IExternalDeviceService {
    private _deviceService: IDeviceService;

    constructor(private readonly moduleRef: ModuleRef) {}

    private get deviceService() {
        if (this._deviceService) {
            return this._deviceService;
        }

        this._deviceService = this.moduleRef.get<IDeviceService>(IDeviceService, {
            strict: false
        });

        return this._deviceService;
    }

    public async getDeviceProductInfo(id: IExternalDeviceId): Promise<IProductInfo> {
        return this.deviceService.findDeviceProductInfo(id);
    }

    public async getDeviceSettings(id: IExternalDeviceId): Promise<IDeviceSettings> {
        const device = await this.deviceService.findByExternalId(id);

        return {
            postForSale: device.automaticPostForSale,
            postForSalePrice: device.defaultAskPrice
        };
    }
}
