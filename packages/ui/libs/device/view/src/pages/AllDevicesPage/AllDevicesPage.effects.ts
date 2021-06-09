import {
  useAllDevices,
  useAllExistingFuelTypes,
} from '@energyweb/origin-ui-device-data';

export const useAllDevicesPageEffects = () => {
  const { allDevices, isLoading: isAllDevicesLoading } = useAllDevices();
  const { allTypes: allDeviceTypes, isLoading: allTypesLoading } =
    useAllExistingFuelTypes();

  const isLoading = isAllDevicesLoading || allTypesLoading;

  return { allDevices, allDeviceTypes, isLoading };
};
