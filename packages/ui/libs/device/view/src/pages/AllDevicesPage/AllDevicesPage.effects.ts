import {
  useApiAllDevices,
  useAllDeviceFuelTypes,
} from '@energyweb/origin-ui-device-data';

export const useAllDevicesPageEffects = () => {
  const { allDevices, isLoading: isAllDevicesLoading } = useApiAllDevices();
  const { allTypes: allDeviceTypes, isLoading: allTypesLoading } =
    useAllDeviceFuelTypes();

  const isLoading = isAllDevicesLoading || allTypesLoading;

  return { allDevices, allDeviceTypes, isLoading };
};
