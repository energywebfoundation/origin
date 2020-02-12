export enum DeviceStatus {
    Submitted,
    Denied,
    Active
}

export interface IDevice {
    status: DeviceStatus;
    facilityName: string;
    description: string;
    images: string;
    address: string;
    region: string;
    province: string;
    country: string;
    operationalSince: number;
    capacityInW: number;
    gpsLatitude: string;
    gpsLongitude: string;
    timezone: string;
    deviceType: string;
    complianceRegistry: string;
    otherGreenAttributes: string;
    typeOfPublicSupport: string;
    deviceGroup?: string;
}

export interface IDeviceWithId extends IDevice {
    id: number;
}

export type DeviceUpdateData = Pick<IDevice, 'status'>;
