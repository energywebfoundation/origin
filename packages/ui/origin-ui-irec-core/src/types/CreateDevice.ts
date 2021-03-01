import { IExternalDeviceId } from '@energyweb/origin-backend-core';

export type CreateDeviceData = {
    name: string;
    code: string;
    defaultAccount: string;
    deviceType: string;
    fuel: string;
    countryCode: string;
    capacity: number;
    commissioningDate: string;
    registrationDate: string;
    address: string;
    latitude: string;
    longitude: string;
    timezone: string;
    gridOperator: string;
    notes: string;
    smartMeterId: string;
    description: string;
    externalDeviceIds?: IExternalDeviceId[];
    imageIds: string[];
};