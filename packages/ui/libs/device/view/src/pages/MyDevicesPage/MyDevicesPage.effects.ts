import {
  useAllDeviceFuelTypes,
  useApiMyDevices,
  useApiPermissions,
} from '@energyweb/origin-ui-device-data';

export const useMyDevicePageEffects = () => {
  const { permissions } = useApiPermissions();
  const { myDevices, isLoading: myDevicesLoading } = useApiMyDevices();
  const { allTypes: allDeviceTypes, isLoading: allTypesLoading } =
    useAllDeviceFuelTypes();

  const isLoading = myDevicesLoading || allTypesLoading;

  return { myDevices, allDeviceTypes, isLoading, permissions };
};
