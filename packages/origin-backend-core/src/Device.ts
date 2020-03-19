import { IOrganization } from '.';

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
    getLatest(device: IDeviceWithRelationsIds): Promise<ISmartMeterRead>;
    getAll(device: IDeviceWithRelationsIds): Promise<ISmartMeterRead[]>;
    save(device: IDeviceWithRelationsIds, smRead: ISmartMeterRead): Promise<void>;
}

export interface IDeviceProperties {
    id: number;
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

export interface IDevice extends IDeviceProperties {
    organization: IOrganization | IOrganization['id'];
}

export interface IDeviceWithRelationsIds extends IDevice {
    organization: IOrganization['id'];
}

export interface IDeviceWithRelations extends IDevice {
    organization: IOrganization;
}

export type DeviceCreateData = Omit<IDeviceProperties, 'id'>;
export type DeviceUpdateData = Pick<IDevice, 'status'>;
