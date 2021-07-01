import { IExternalDeviceId } from '@energyweb/origin-backend-core';
import { DeviceState } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';

export type ComposedDevice = {
  id: string;
  ownerId: string;
  owner: string;
  externalRegistryId: string;
  code: string;
  name: string;
  defaultAccount: string;
  deviceType: string;
  fuelType: string;
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
  postalCode: string;
  region: string;
  subregion: string;
  externalDeviceIds?: IExternalDeviceId[];
  imageIds?: string[];
};

export type ComposedPublicDevice = Omit<ComposedDevice, 'defaultAccount'>;

export type TRegisterDeviceFormValues = {
  facilityName: string;
  fuelType: string[];
  deviceType: string[];
  commissioningDate: string;
  registrationDate: string;
  capacity: string;
  gridOperator: string;
  description: string;
  smartMeterId: string;
  countryCode: string[];
  region: string;
  subregion: string;
  postalCode: string;
  address: string;
  latitude: string;
  longitude: string;
  imageIds: string[];
};

export type TCreateDeviceData = {
  name: string;
  code: string;
  defaultAccount: string;
  deviceType: string;
  fuelType: string;
  countryCode: string;
  capacity: string;
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
  country: string;
  postalCode: string;
  region: string;
  subregion: string;
};
