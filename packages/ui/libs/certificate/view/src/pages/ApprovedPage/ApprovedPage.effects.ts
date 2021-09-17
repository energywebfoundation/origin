import {
  useApiApprovedCertificates,
  useApiAllDevices,
  useAllFuelTypes,
  downloadFileHandler,
} from '@energyweb/origin-ui-certificate-data';
import { useApprovedCertificatesLogic } from '@energyweb/origin-ui-certificate-logic';

export const useApprovedPageEffects = () => {
  const {
    allDevices: devices,
    isLoading: areDevicesLoading,
  } = useApiAllDevices();
  const {
    allTypes: allFuelTypes,
    isLoading: isFuelTypesloading,
  } = useAllFuelTypes();
  const {
    approvedCertificates,
    isLoading: areRequestsLoading,
  } = useApiApprovedCertificates();

  const loading = isFuelTypesloading || areDevicesLoading || areRequestsLoading;

  const tableData = useApprovedCertificatesLogic({
    devices,
    certificates: approvedCertificates,
    loading,
    allFuelTypes,
    downloadFileHandler,
  });

  return {
    tableData,
  };
};
