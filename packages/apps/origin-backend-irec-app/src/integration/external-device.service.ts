import { IExternalDeviceService, IProductInfo } from '@energyweb/exchange';
import { DeviceService } from '@energyweb/origin-device-registry-irec-local-api';
import { IExternalDeviceId } from '@energyweb/origin-backend-core';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class ExternalDeviceService implements IExternalDeviceService {
    private _deviceService: DeviceService;

    constructor(private readonly moduleRef: ModuleRef) {}

    private get deviceService() {
        if (this._deviceService) {
            return this._deviceService;
        }

        this._deviceService = this.moduleRef.get<DeviceService>(DeviceService, {
            strict: false
        });

        return this._deviceService;
    }

    public async getDeviceProductInfo({ id }: IExternalDeviceId): Promise<IProductInfo> {
        const device = await this.deviceService.findOne(id);

        if (!device.fuelType || !device.deviceType) {
            throw new Error(
                `Unknown device or fuel type for device with ID ${id}: DeviceType=${device.deviceType}, FuelType=${device.fuelType}`
            );
        }

        return {
            deviceType: `${device.fuelType};${device.deviceType}`,
            region: '',
            province: '',
            country: device.countryCode,
            operationalSince: device.commissioningDate.getTime(),
            gridOperator: device.gridOperator
        };
    }
}
