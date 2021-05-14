import { OriginDeviceDTO } from '@energyweb/origin-device-registry-api-react-query-client';
import { PublicDeviceDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { ComposedPublicDevice } from './types';

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
