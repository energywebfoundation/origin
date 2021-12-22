import {
  useAllDeviceFuelTypes,
  useApiMyDevices,
  useApiUserAndAccount,
  useCachedIRecConnection,
  useCachedIRecOrg,
} from '@energyweb/origin-ui-device-data';
import {
  defaultRequirementList,
  Requirement,
  usePermissionsLogic,
} from '@energyweb/origin-ui-device-logic';

const permissionsConfig = [
  ...defaultRequirementList,
  ...(process.env.NODE_ENV === 'development'
    ? []
    : [Requirement.HasIRecOrg, Requirement.HasIRecApiConnection]),
];

export const useMyDevicePageEffects = () => {
  const {
    user,
    exchangeDepositAddress,
    isLoading: userAndAccountLoading,
  } = useApiUserAndAccount();
  const iRecOrg = useCachedIRecOrg();
  const iRecConnection = useCachedIRecConnection();

  const { canAccessPage, requirementsProps } = usePermissionsLogic({
    user,
    exchangeDepositAddress,
    iRecOrg,
    iRecConnection,
    config: permissionsConfig,
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
