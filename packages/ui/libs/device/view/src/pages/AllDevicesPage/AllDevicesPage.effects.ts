import { useApiFetchAllDevices } from '@energyweb/origin-ui-device-data';

export const useAllDevicesPageEffects = () => {
  const { allDevices, isLoading: isAllDevicesLoading } =
    useApiFetchAllDevices();
  const { allDevices: allDeviceTypes, isLoading: allTypesLoading } =
    useApiFetchAllDevices();

  const isLoading = isAllDevicesLoading || allTypesLoading;

  return { allDevices, allDeviceTypes, isLoading };
};
