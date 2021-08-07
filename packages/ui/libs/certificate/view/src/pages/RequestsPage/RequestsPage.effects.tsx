import {
  useCertificationRequests,
  useApiMyDevices,
  useAllFuelTypes,
  useExchangeAddress,
  downloadFileHandler,
} from '@energyweb/origin-ui-certificate-data';
import { useCertificateRequestsLogic } from '@energyweb/origin-ui-certificate-logic';

export const useRequestsPageEffects = () => {
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

  const tableData = useCertificateRequestsLogic({
    devices,
    requests,
    allFuelTypes,
    exchangeAddress,
    loading,
    downloadFileHandler,
  });

  return {
    tableData,
  };
};
