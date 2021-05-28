import { IExternalDeviceId } from '@energyweb/origin-backend-core';
import { DeviceState } from '@energyweb/origin-device-registry-irec-local-api-client';

export type ComposedDevice = {
    id: string;
    ownerId: string;
    externalRegistryId: string;
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
    status: DeviceState;
    timezone: string;
    gridOperator: string;
    smartMeterId: string;
    description: string;
    externalDeviceIds?: IExternalDeviceId[];
    imageIds?: string[];
    country: string;
    postalCode: string;
    region: string;
    subregion: string;
};

export type ComposedPublicDevice = Omit<ComposedDevice, 'defaultAccount'>;
