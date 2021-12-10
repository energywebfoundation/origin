import { FullOrganizationInfoDTO } from '@energyweb/origin-backend-react-query-client';
import {
  OriginDeviceDTO,
  NewDeviceDTO as OriginCreateDeviceDTO,
} from '@energyweb/origin-device-registry-api-react-query-client';
import {
  PublicDeviceDTO,
  DeviceDTO as IRecMyDeviceDTO,
  CreateDeviceDTO as IRecCreateDeviceDTO,
} from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { PowerFormatter } from '@energyweb/origin-ui-utils';
import { TimeZone, TimeZones } from '@energyweb/utils-general';
import { uniqBy } from 'lodash';
import {
  ComposedDevice,
  ComposedPublicDevice,
  TRegisterDeviceFormValues,
} from './types';

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

export type TDecomposeForIRecArgs = {
  newDevice: TRegisterDeviceFormValues;
  organization: FullOrganizationInfoDTO;
  platformCountryCode: string;
  moreThanOneTimeZone: boolean;
  timeZones: TimeZone[];
};

export function decomposeForIRec({
  newDevice,
  organization,
  platformCountryCode,
  moreThanOneTimeZone,
  timeZones,
}: TDecomposeForIRecArgs): IRecCreateDeviceDTO {
  const iRecCreateDevice: IRecCreateDeviceDTO = {
    name: newDevice.facilityName,
    deviceType: newDevice.deviceType[0].value.toString(),
    fuelType: newDevice.fuelType[0].value.toString(),
    countryCode: platformCountryCode,
    capacity: PowerFormatter.getBaseValueFromValueInDisplayUnit(
      parseFloat(newDevice.capacity)
    ),
    commissioningDate: newDevice.commissioningDate,
    registrationDate: newDevice.registrationDate,
    address: newDevice.address,
    latitude: newDevice.latitude,
    longitude: newDevice.longitude,
    notes: newDevice.description,
    timezone: moreThanOneTimeZone
      ? newDevice.timeZone[0].value.toString()
      : timeZones[0].timeZone,
    gridOperator: newDevice.gridOperator,
    irecTradeAccountCode: newDevice.irecTradeAccountCode || undefined,
    postalCode: organization.zipCode,
    region: newDevice.region[0].value.toString(),
    subregion: newDevice.subregion[0].value.toString(),
  };

  return iRecCreateDevice;
}

export function decomposeForOrigin(
  newDevice: TRegisterDeviceFormValues
): OriginCreateDeviceDTO {
  return {
    externalRegistryId: null,
    smartMeterId: newDevice.smartMeterId,
    description: newDevice.description,
    externalDeviceIds: [],
    imageIds: newDevice.imageIds,
  };
}

export const getCountriesTimeZones = (platformCountryCode: string) => {
  const countryTimezones = uniqBy(
    TimeZones.filter(
      (timezone) => timezone.countryCode === platformCountryCode
    ),
    'utcOffset'
  );
  const moreThanOneTimeZone = countryTimezones.length > 1;

  return { countryTimezones, moreThanOneTimeZone };
};
