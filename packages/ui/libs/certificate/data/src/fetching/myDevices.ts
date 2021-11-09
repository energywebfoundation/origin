import { useDeviceRegistryControllerGetMyDevices } from '@energyweb/origin-device-registry-api-react-query-client';
import { useDeviceControllerGetMyDevices } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { composeMyDevices } from '../utils';
import { ComposedDevice } from '../types';

export const useApiMyDevices = () => {
  const { data: allOriginDevices, isLoading: isOriginDevicesLoading } =
    useDeviceRegistryControllerGetMyDevices();

  const { data: allIRecDevices, isLoading: isIRecDevicesLoading } =
    useDeviceControllerGetMyDevices();

  const isLoading = isOriginDevicesLoading || isIRecDevicesLoading;
  const myDevices =
    allOriginDevices && allIRecDevices
      ? composeMyDevices(allOriginDevices, allIRecDevices)
      : ([] as ComposedDevice[]);

  return { isLoading, myDevices };
};
