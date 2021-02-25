import { IExternalDeviceId } from '@energyweb/origin-backend-core';

export interface IProductInfo {
    deviceType: string;
    region: string;
    province: string;
    country: string;
    operationalSince: number;
    gridOperator: string;
}

export const IExternalDeviceService = Symbol('IExternalDeviceService');
export interface IExternalDeviceService {
    getDeviceProductInfo(id: IExternalDeviceId): Promise<IProductInfo>;
}
