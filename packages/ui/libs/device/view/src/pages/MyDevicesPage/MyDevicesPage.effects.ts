import {
  useAllDeviceFuelTypes,
  useApiMyDevices,
  useApiUserAndAccount,
} from '@energyweb/origin-ui-device-data';
import { usePermissionsLogic } from '@energyweb/origin-ui-device-logic';

export const useMyDevicePageEffects = () => {
  const {
    user,
    exchangeDepositAddress,
    isLoading: userAndAccountLoading,
  } = useApiUserAndAccount();
  const { canAccessPage, requirementsProps } = usePermissionsLogic({
    user,
    exchangeDepositAddress,
  });

  const { myDevices, isLoading: myDevicesLoading } = useApiMyDevices();
  const { allTypes: allDeviceTypes, isLoading: allTypesLoading } =
    useAllDeviceFuelTypes();

  const isLoading =
    myDevicesLoading || allTypesLoading || userAndAccountLoading;

  return {
    myDevices,
    allDeviceTypes,
    isLoading,
    canAccessPage,
    requirementsProps,
  };
};
