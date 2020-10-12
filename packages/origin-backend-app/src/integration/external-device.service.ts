import { IDeviceSettings, IExternalDeviceService, IProductInfo } from '@energyweb/exchange';
import { DeviceService } from '@energyweb/origin-backend';
import { IExternalDeviceId } from '@energyweb/origin-backend-core';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class ExternalDeviceService implements IExternalDeviceService {
    private deviceService: DeviceService;

    constructor(private readonly moduleRef: ModuleRef) {
        this.deviceService = this.moduleRef.get<DeviceService>(DeviceService, {
            strict: false
        });
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
