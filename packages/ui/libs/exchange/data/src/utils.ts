import { OriginDeviceDTO } from '@energyweb/origin-device-registry-api-react-query-client';
import {
  DeviceState,
  PublicDeviceDTO,
} from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { IExternalDeviceId } from '@energyweb/origin-backend-core';

export type ComposedPublicDevice = {
  id: string;
  ownerId: string;
  owner: string;
  externalRegistryId: string;
  code: string;
  name: string;
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

export function composePublicDevices(
  originDevices: OriginDeviceDTO[],
  iRecDevices: PublicDeviceDTO[]
): ComposedPublicDevice[] {
  if (!originDevices || !iRecDevices) return [];
  const composedResult: ComposedPublicDevice[] = [];

  for (const originDevice of originDevices) {
    const matchingIRecDevice = iRecDevices.find(
      (device) => device.id === originDevice.externalRegistryId
    );
    composedResult.push({
      ...originDevice,
      ...matchingIRecDevice,
      id: originDevice.id,
    });
  }
  return composedResult;
}
