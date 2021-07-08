import {
  useIrecCertificates,
  useApiMyDevices,
  useAllFuelTypes,
  certificates as certificatesMock,
} from '@energyweb/origin-ui-certificate-data';
import { useLogicClaimsReport } from '@energyweb/origin-ui-certificate-logic';

export const useClaimsReportPageEffects = () => {
  const { myDevices: devices, isLoading: areDevicesLoading } =
    useApiMyDevices();

  const { allTypes: allFuelTypes, isLoading: isFuelTypesloading } =
    useAllFuelTypes();

  const { isLoading: allCertificatesLoading } = useIrecCertificates();

  const loading =
    isFuelTypesloading || areDevicesLoading || allCertificatesLoading;

  const tableData = useLogicClaimsReport({
    devices,
    allFuelTypes,
    certificates: certificatesMock,
    loading,
  });

  return {
    tableData,
  };
};
