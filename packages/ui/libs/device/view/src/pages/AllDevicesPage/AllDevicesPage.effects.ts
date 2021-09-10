import { DeviceState } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import {
  useApiAllDevices,
  useAllDeviceFuelTypes,
} from '@energyweb/origin-ui-device-data';

export const useAllDevicesPageEffects = () => {
  const { allDevices, isLoading: isAllDevicesLoading } = useApiAllDevices();
  const {
    allTypes: allDeviceTypes,
    isLoading: allTypesLoading,
  } = useAllDeviceFuelTypes();

  const allActiveDevices = allDevices.filter(
    (device) => device.status === DeviceState.Approved
  );

  const isLoading = isAllDevicesLoading || allTypesLoading;

  return { allActiveDevices, allDeviceTypes, isLoading };
};
