import {
  getDeviceRegistryControllerGetMyDevicesQueryKey,
  OriginDeviceDTO,
} from '@energyweb/origin-device-registry-api-react-query-client';
import {
  DeviceDTO,
  getDeviceControllerGetMyDevicesQueryKey,
} from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { useQueryClient } from 'react-query';
import { ComposedDevice } from '../types';
import { composeMyDevices } from '../utils';

export const useCachedMyDevices = () => {
  const queryClient = useQueryClient();
  const myOriginDevicesQueryKey =
    getDeviceRegistryControllerGetMyDevicesQueryKey();
  const myIRecDevicesQueryKey = getDeviceControllerGetMyDevicesQueryKey();

  const cachedOriginDevices = queryClient.getQueryData<OriginDeviceDTO[]>(
    myOriginDevicesQueryKey
  );
  const cacheIRecDevices = queryClient.getQueryData<DeviceDTO[]>(
    myIRecDevicesQueryKey
  );

  const cachedMyDevices =
    cachedOriginDevices && cacheIRecDevices
      ? composeMyDevices(cachedOriginDevices, cacheIRecDevices)
      : ([] as ComposedDevice[]);

  return cachedMyDevices;
};
