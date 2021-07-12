import {
  useAllFuelTypes,
  useClaimedCertificates,
} from '@energyweb/origin-ui-certificate-data';
import { useLogicClaimsReport } from '@energyweb/origin-ui-certificate-logic';
import { useApiAllDevices } from '@energyweb/origin-ui-device-data';

export const useClaimsReportPageEffects = () => {
  const {
    claimedCertificates,
    blockchainCertificates,
    isLoading: areClaimedLoading,
  } = useClaimedCertificates();

  const { allDevices: devices, isLoading: areDevicesLoading } =
    useApiAllDevices();

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
