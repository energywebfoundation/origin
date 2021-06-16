import {
  useAllDevices,
  useAllDeviceFuelTypes,
} from '@energyweb/origin-ui-device-data';

export const useAllDevicesPageEffects = () => {
  const { allDevices, isLoading: isAllDevicesLoading } = useAllDevices();
  const { allTypes: allDeviceTypes, isLoading: allTypesLoading } =
    useAllDeviceFuelTypes();

  const isLoading = isAllDevicesLoading || allTypesLoading;

  return { allDevices, allDeviceTypes, isLoading };
};
