import {
  getDeviceRegistryControllerGetAllQueryKey,
  OriginDeviceDTO,
} from '@energyweb/origin-device-registry-api-react-query-client';
import {
  getDeviceControllerGetAllQueryKey,
  PublicDeviceDTO,
} from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { useQueryClient } from 'react-query';
import { composePublicDevices, ComposedPublicDevice } from './utils';

export const useCachedAllDevices = () => {
  const queryClient = useQueryClient();
  const allOriginDevicesQueryKey = getDeviceRegistryControllerGetAllQueryKey();
  const allIRecDevicesQueryKey = getDeviceControllerGetAllQueryKey();

  const cachedOriginDevices = queryClient.getQueryData<OriginDeviceDTO[]>(
    allOriginDevicesQueryKey
  );
  const cacheIRecDevices = queryClient.getQueryData<PublicDeviceDTO[]>(
    allIRecDevicesQueryKey
  );

  const cachedMyDevices =
    cachedOriginDevices && cacheIRecDevices
      ? composePublicDevices(cachedOriginDevices, cacheIRecDevices)
      : ([] as ComposedPublicDevice[]);

  return cachedMyDevices;
};
