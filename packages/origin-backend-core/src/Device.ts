export enum DeviceStatus {
    Submitted,
    Denied,
    Active
}

export interface ExternalDeviceId {
    id: string;
    type: string;
}

export type ExternalDeviceIdType = Pick<ExternalDeviceId, 'type'>;

export interface ISmartMeterRead {
    meterReading: number;
    timestamp: number;
}

export interface IEnergyGenerated {
    energy: number;
    timestamp: number;
}

export interface ISmartMeterReadingsAdapter {
    getLatest(device: IDeviceWithId): Promise<ISmartMeterRead>;
    getAll(device: IDeviceWithId): Promise<ISmartMeterRead[]>;
    save(device: IDeviceWithId, smRead: ISmartMeterRead): Promise<void>;
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
    externalDeviceIds?: ExternalDeviceId[];
    lastSmartMeterReading?: ISmartMeterRead;
    deviceGroup?: string;
    smartMeterReads?: ISmartMeterRead[];
}

export interface IDeviceWithId extends IDevice {
    id: number;
}

export type DeviceUpdateData = Pick<IDevice, 'status'>;
