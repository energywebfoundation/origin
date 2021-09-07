import { IExternalDeviceId } from '@energyweb/origin-backend-core';
import {
  OriginDeviceDTO,
  useDeviceRegistryControllerGetAll,
} from '@energyweb/origin-device-registry-api-react-query-client';
import {
  DeviceState,
  PublicDeviceDTO,
  useDeviceControllerGetAll,
} from '@energyweb/origin-device-registry-irec-local-api-react-query-client';

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

export const useFetchAllDevices = () => {
  const {
    data: allOriginDevices,
    isLoading: isOriginDevicesLoading,
  } = useDeviceRegistryControllerGetAll();
  const {
    data: allIRecDevices,
    isLoading: isIRecDevicesLoading,
  } = useDeviceControllerGetAll();

  const allDevices =
    allOriginDevices && allIRecDevices
      ? composePublicDevices(allOriginDevices, allIRecDevices)
      : [];
  const isLoading = isOriginDevicesLoading || isIRecDevicesLoading;

  return { allDevices, isLoading };
};
