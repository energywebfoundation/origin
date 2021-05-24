import { useDeviceRegistryControllerGetAll } from '@energyweb/origin-device-registry-api-react-query-client';
import { useDeviceControllerGetAll } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { composePublicDevices } from './utils';

export const useAllDevices = () => {
  const { data: allOriginDevices } = useDeviceRegistryControllerGetAll();

  const { data: allIRecDevices } = useDeviceControllerGetAll();

  return allOriginDevices && allIRecDevices
    ? composePublicDevices(allOriginDevices, allIRecDevices)
    : [];
};
