import {
  useApiMyDevices,
  useAllFuelTypes,
  useClaimedCertificates,
} from '@energyweb/origin-ui-certificate-data';
import { useLogicClaimsReport } from '@energyweb/origin-ui-certificate-logic';

export const useClaimsReportPageEffects = () => {
  const {
    claimedCertificates,
    blockchainCertificates,
    isLoading: areClaimedLoading,
  } = useClaimedCertificates();

  const { myDevices: devices, isLoading: areDevicesLoading } =
    useApiMyDevices();

  const { allTypes: allFuelTypes, isLoading: isFuelTypesloading } =
    useAllFuelTypes();

  const loading = areClaimedLoading || isFuelTypesloading || areDevicesLoading;

  const tableData = useLogicClaimsReport({
    devices,
    allFuelTypes,
    blockchainCertificates,
    claimedCertificates,
    loading,
  });

  return {
    tableData,
  };
};
