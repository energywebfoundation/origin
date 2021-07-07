import {
  useCertificationRequests,
  useApiMyDevices,
  useAllFuelTypes,
} from '@energyweb/origin-ui-certificate-data';
import { useLogicCertificateRequests } from '@energyweb/origin-ui-certificate-logic';

export const useRequestsPageEffects = () => {
  const { myDevices: devices, isLoading: areDevicesLoading } =
    useApiMyDevices();

  const { allTypes: allFuelTypes, isLoading: isFuelTypesloading } =
    useAllFuelTypes();

  const { requests, isLoading: allRequestsLoading } =
    useCertificationRequests();

  const loading = isFuelTypesloading || areDevicesLoading || allRequestsLoading;

  const tableData = useLogicCertificateRequests({
    devices,
    requests,
    loading,
    allFuelTypes,
  });

  return {
    tableData,
  };
};
