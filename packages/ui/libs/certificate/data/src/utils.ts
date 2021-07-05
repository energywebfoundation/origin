import { OriginDeviceDTO } from '@energyweb/origin-device-registry-api-react-query-client';
import { DeviceDTO as IRecMyDeviceDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { ComposedDevice } from './types';

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
