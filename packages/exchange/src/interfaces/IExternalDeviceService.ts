import { IExternalDeviceId } from '@energyweb/origin-backend-core';

export interface IProductInfo {
    deviceType: string;
    region: string;
    province: string;
    country: string;
    operationalSince: number;
    gridOperator: string;
}

export interface IDeviceSettings {
    postForSale: boolean;
    postForSalePrice: number;
}

export const IExternalDeviceService = Symbol('IExternalDeviceService');
export interface IExternalDeviceService {
    getDeviceProductInfo(id: IExternalDeviceId): Promise<IProductInfo>;
    getDeviceSettings(id: IExternalDeviceId): Promise<IDeviceSettings>;
}
