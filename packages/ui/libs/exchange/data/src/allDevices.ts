import { useDeviceRegistryControllerGetAll } from '@energyweb/origin-device-registry-api-react-query-client';
import { useDeviceControllerGetAll } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { composePublicDevices } from './utils';

export const useApiAllDevices = () => {
  const { data: allOriginDevices, isLoading: isOriginDevicesLoading } =
    useDeviceRegistryControllerGetAll();
  const { data: allIRecDevices, isLoading: isIRecDevicesLoading } =
    useDeviceControllerGetAll();

  const allDevices =
    allOriginDevices && allIRecDevices
      ? composePublicDevices(allOriginDevices, allIRecDevices)
      : [];
  const isLoading = isOriginDevicesLoading || isIRecDevicesLoading;

  return { allDevices, isLoading };
};
