import {
  useCertificationRequests,
  useApiMyDevices,
  useAllFuelTypes,
  useExchangeAddress,
  useApiPermissions,
} from '@energyweb/origin-ui-certificate-data';
import { useLogicCertificateRequests } from '@energyweb/origin-ui-certificate-logic';

export const useRequestsPageEffects = () => {
  const { permissions } = useApiPermissions();
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
    isExchangeAddressLoading;

  const tableData = useLogicCertificateRequests({
    devices,
    requests,
    allFuelTypes,
    exchangeAddress,
    loading,
  });

  return {
    tableData,
    permissions,
  };
};
