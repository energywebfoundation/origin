import {
  useAllExistingFuelTypes,
  useMyDevices,
} from '@energyweb/origin-ui-device-data';

export const useMyDevicePageEffects = () => {
  const { myDevices, isLoading: myDevicesLoading } = useMyDevices();
  const { allTypes: allDeviceTypes, isLoading: allTypesLoading } =
    useAllExistingFuelTypes();

  const isLoading = myDevicesLoading || allTypesLoading;

  return { myDevices, allDeviceTypes, isLoading };
};
