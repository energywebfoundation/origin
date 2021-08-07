import {
  useAllFuelTypes,
  useClaimedCertificates,
  useApiUserAndAccount,
} from '@energyweb/origin-ui-certificate-data';
import { useApiAllDevices } from '@energyweb/origin-ui-certificate-data';
import {
  useLogicClaimsReport,
  usePermissionsLogic,
} from '@energyweb/origin-ui-certificate-logic';

export const useClaimsReportPageEffects = () => {
  const {
    user,
    exchangeDepositAddress,
    isLoading: userAndAccountLoading,
  } = useApiUserAndAccount();
  const { canAccessPage, requirementsProps } = usePermissionsLogic({
    user,
    exchangeDepositAddress,
  });

  const {
    claimedCertificates,
    blockchainCertificates,
    isLoading: areClaimedLoading,
  } = useClaimedCertificates();

  const { allDevices: devices, isLoading: areDevicesLoading } =
    useApiAllDevices();

  const { allTypes: allFuelTypes, isLoading: isFuelTypesloading } =
    useAllFuelTypes();

  const loading =
    areClaimedLoading ||
    isFuelTypesloading ||
    areDevicesLoading ||
    userAndAccountLoading;

  const tableData = useLogicClaimsReport({
    devices,
    allFuelTypes,
    blockchainCertificates,
    claimedCertificates,
    loading,
  });

  return {
    tableData,
    canAccessPage,
    requirementsProps,
  };
};
