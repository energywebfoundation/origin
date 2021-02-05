import { DeviceStatus } from '@energyweb/origin-backend-core';

export type IRecDeviceDTO = {
    id: string;
    ownerId: string;
    code: string;
    name: string;
    defaultAccount: string;
    deviceType: string;
    fuel: string;
    countryCode: string;
    registrantOrganization: string;
    issuer: string;
    capacity: number;
    commissioningDate: string;
    registrationDate: string;
    address: string;
    latitude: string;
    longitude: string;
    notes: string;
    status: DeviceStatus;
    timezone: string;
    gridOperator: string;
};

export type IRecPublicDeviceDTO = Omit<IRecDeviceDTO, 'defaultAccount'>;
