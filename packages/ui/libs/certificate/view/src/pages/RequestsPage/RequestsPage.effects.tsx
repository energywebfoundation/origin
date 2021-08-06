import {
  useCertificationRequests,
  useApiMyDevices,
  useAllFuelTypes,
  useExchangeAddress,
  useApiUserAndAccount,
} from '@energyweb/origin-ui-certificate-data';
import {
  useLogicCertificateRequests,
  usePermissionsLogic,
} from '@energyweb/origin-ui-certificate-logic';

export const useRequestsPageEffects = () => {
  const {
    user,
    exchangeDepositAddress,
    isLoading: userAndAccountLoading,
  } = useApiUserAndAccount();
  const { canAccessPage, requirementsProps } = usePermissionsLogic({
    user,
    exchangeDepositAddress,
  });

  const { myDevices: devices, isLoading: areDevicesLoading } =
    useApiMyDevices();

  const { allTypes: allFuelTypes, isLoading: isFuelTypesloading } =
    useAllFuelTypes();

  const { requests, isLoading: allRequestsLoading } =
    useCertificationRequests();

  const { exchangeAddress, isLoading: isExchangeAddressLoading } =
    useExchangeAddress();

  const loading =
    isFuelTypesloading ||
    areDevicesLoading ||
    allRequestsLoading ||
    isExchangeAddressLoading ||
    userAndAccountLoading;

  const tableData = useLogicCertificateRequests({
    devices,
    requests,
    allFuelTypes,
    exchangeAddress,
    loading,
  });

  return {
    tableData,
    canAccessPage,
    requirementsProps,
  };
};
