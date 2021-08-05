import {
  useAllDeviceFuelTypes,
  useApiMyDevices,
} from '@energyweb/origin-ui-device-data';
import { usePermissions } from '@energyweb/origin-ui-utils';

export const useMyDevicePageEffects = () => {
  const { canAccessPage } = usePermissions();
  const { myDevices, isLoading: myDevicesLoading } = useApiMyDevices();
  const { allTypes: allDeviceTypes, isLoading: allTypesLoading } =
    useAllDeviceFuelTypes();

  const isLoading = myDevicesLoading || allTypesLoading;

  return { myDevices, allDeviceTypes, isLoading, canAccessPage };
};
