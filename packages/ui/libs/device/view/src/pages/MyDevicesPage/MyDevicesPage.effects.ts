import {
  useAllDeviceFuelTypes,
  useApiFetchMyDevices,
} from '@energyweb/origin-ui-device-data';

export const useMyDevicePageEffects = () => {
  const { myDevices, isLoading: myDevicesLoading } = useApiFetchMyDevices();
  const { allTypes: allDeviceTypes, isLoading: allTypesLoading } =
    useAllDeviceFuelTypes();

  const isLoading = myDevicesLoading || allTypesLoading;

  return { myDevices, allDeviceTypes, isLoading };
};
