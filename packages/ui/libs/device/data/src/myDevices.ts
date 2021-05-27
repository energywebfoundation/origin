import { useDeviceRegistryControllerGetMyDevices } from '@energyweb/origin-device-registry-api-react-query-client';
import { useDeviceControllerGetMyDevices } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { composeMyDevices } from './utils';

export const useMyDevices = () => {
  const { data: allOriginDevices } = useDeviceRegistryControllerGetMyDevices();

  const { data: allIRecDevices } = useDeviceControllerGetMyDevices();

  return allOriginDevices && allIRecDevices
    ? composeMyDevices(allOriginDevices, allIRecDevices)
    : [];
};
