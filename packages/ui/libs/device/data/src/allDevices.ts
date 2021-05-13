import { useDeviceRegistryControllerGetAll } from '@energyweb/origin-device-registry-api-react-query-client';
import { useDeviceControllerGetAll } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { composePublicDevices } from './utils';

export const useAllDevices = () => {
  const { data: originDeviceQuery } = useDeviceRegistryControllerGetAll();
  const allOriginDevices = originDeviceQuery?.data;

  const { data: iRecDeviceQuery } = useDeviceControllerGetAll();
  const allIRecDevices = iRecDeviceQuery?.data;

  return allOriginDevices && allIRecDevices
    ? composePublicDevices(allOriginDevices, allIRecDevices)
    : [];
};
