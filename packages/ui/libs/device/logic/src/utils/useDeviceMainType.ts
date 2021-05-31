import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import {
  ComposedPublicDevice,
  ComposedDevice,
} from '@energyweb/origin-ui-device-data';

export const useDeviceMainType = (
  deviceType: string,
  allTypes: CodeNameDTO[]
) => {
  try {
    const decodedType = allTypes.find((type) => type.code === deviceType).name;

    const mainType = decodedType.split(':')[0];
    const restType =
      decodedType.split(':').length > 1 ? decodedType.slice(1) : '';

    return { mainType, restType };
  } catch (error) {
    throw new Error('Provided device type does not match with any known type');
  }
};

export const getDeviceDetailedType = (
  device: ComposedPublicDevice | ComposedDevice
) => {
  const arr = device.deviceType.split(';');
  arr.shift();
  return arr.length > 1 ? arr.join(' - ') : arr[0];
};
