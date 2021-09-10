import { DeviceState } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { useApiAllDevices } from './allDevices';

export const useApiPendingDevices = () => {
  const { allDevices, isLoading } = useApiAllDevices();
  const pendingDevices = allDevices?.filter(
    (device) => device.status === DeviceState.Inprogress
  );
  return { pendingDevices, isLoading };
};
