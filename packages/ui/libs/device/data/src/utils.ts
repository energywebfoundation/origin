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

export function decomposeForIRec(
  newDevice: TRegisterDeviceFormValues,
  organization: FullOrganizationInfoDTO
): IRecCreateDeviceDTO {
  const iRecCreateDevice: IRecCreateDeviceDTO = {
    name: newDevice.facilityName,
    // should it be the blockchainAccount or exchangeDepositAddress?
    defaultAccount: organization.blockchainAccountAddress,
    deviceType: newDevice.deviceType,
    fuelType: newDevice.fuelType,
    // should it the organization country or user should add this in device form registration?
    countryCode: organization.country,
    capacity: PowerFormatter.getBaseValueFromValueInDisplayUnit(
      parseFloat(newDevice.capacity)
    ),
    commissioningDate: newDevice.commissioningDate,
    registrationDate: newDevice.registrationDate,
    address: newDevice.address,
    latitude: newDevice.latitude,
    longitude: newDevice.longitude,
    // is notes simillar to project story from old device api?
    notes: newDevice.projectStory,
    // should we use an env variable for propery (e.g. MARKET_TIMEZONE) or this will be taken based on user locale?
    timezone: 'Asia/Bangkok',
    gridOperator: newDevice.gridOperator,
    // should it be a separate field or taken from organization?
    postalCode: organization.zipCode,
    // should it be a separate field or taken from organization?
    country: organization.country,
    region: newDevice.region,
    subregion: newDevice.subregion,
  };

  return iRecCreateDevice;
}

export function decomposeForOrigin(
  newDevice: TRegisterDeviceFormValues
): OriginCreateDeviceDTO {
  return {
    externalRegistryId: null,
    smartMeterId: newDevice.smartMeterId,
    // should it be the same as notes in i-rec device?
    description: newDevice.projectStory,
    // isn't it similar to smartMeterId? This is mocked for now
    externalDeviceIds: [],
    imageIds: [''],
  };
}
