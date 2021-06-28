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
    deviceType: newDevice.deviceType,
    fuelType: newDevice.fuelType,
    countryCode: organization.country,
    capacity: PowerFormatter.getBaseValueFromValueInDisplayUnit(
      parseFloat(newDevice.capacity)
    ),
    commissioningDate: newDevice.commissioningDate,
    registrationDate: newDevice.registrationDate,
    address: newDevice.address,
    latitude: newDevice.latitude,
    longitude: newDevice.longitude,
    notes: newDevice.description,
    timezone: 'Asia/Bangkok',
    gridOperator: newDevice.gridOperator,
    postalCode: organization.zipCode,
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
    description: newDevice.description,
    externalDeviceIds: [],
    imageIds: newDevice.imageIds,
  };
}
