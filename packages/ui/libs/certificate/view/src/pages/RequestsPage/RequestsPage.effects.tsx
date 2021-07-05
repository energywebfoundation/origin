import {
  useCertificationRequests,
  useApiMyDevices,
  useAllDeviceTypes,
} from '@energyweb/origin-ui-certificate-data';
import { useLogicCertificateRequests } from '@energyweb/origin-ui-certificate-logic';

export const useRequestsPageEffects = () => {
  const { myDevices: devices, isLoading: areDevicesLoading } =
    useApiMyDevices();

  const { allTypes: allDeviceTypes, isLoading: isDeviceTypesloading } =
    useAllDeviceTypes();

  const { requests, isLoading: allRequestsLoading } =
    useCertificationRequests();

  const loading =
    isDeviceTypesloading || areDevicesLoading || allRequestsLoading;

  const tableData = useLogicCertificateRequests({
    devices,
    requests,
    loading,
    allDeviceTypes,
  });

  return {
    tableData,
  };
};
