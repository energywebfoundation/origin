import { OriginDeviceDTO } from '@energyweb/origin-device-registry-api-react-query-client';
import {
  DeviceState,
  PublicDeviceDTO,
  DeviceDTO as IRecMyDeviceDTO,
} from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { IExternalDeviceId } from '@energyweb/origin-backend-core';
import {
  Filter,
  ProductFilterDTO,
} from '@energyweb/exchange-irec-react-query-client';

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

export function composeMyDevices(
  originDevices: OriginDeviceDTO[],
  iRecDevices: IRecMyDeviceDTO[]
): ComposedDevice[] {
  const composedResult: ComposedDevice[] = [];

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

export type OrderBookFilters = {
  deviceType: string[];
  gridOperator: string[];
  generationDateStart?: string;
  generationDateEnd?: string;
  location: string[];
};

export const getProductFilterConfig = ({
  deviceType,
  gridOperator,
  generationDateStart,
  generationDateEnd,
  location,
}: OrderBookFilters): ProductFilterDTO => {
  return {
    deviceTypeFilter:
      deviceType.length > 0 ? Filter.Specific : Filter.Unspecified,
    locationFilter: location.length > 0 ? Filter.Specific : Filter.Unspecified,
    gridOperatorFilter:
      gridOperator.length > 0 ? Filter.Specific : Filter.Unspecified,
    generationTimeFilter:
      generationDateStart && generationDateEnd
        ? Filter.Specific
        : Filter.Unspecified,
    deviceVintageFilter: Filter.Unspecified,
    deviceType: deviceType.length > 0 ? deviceType : undefined,
    location: location.length > 0 ? location : undefined,
    gridOperator: gridOperator.length > 0 ? gridOperator : undefined,
    generationFrom: generationDateStart ?? undefined,
    generationTo: generationDateEnd ?? undefined,
  };
};
