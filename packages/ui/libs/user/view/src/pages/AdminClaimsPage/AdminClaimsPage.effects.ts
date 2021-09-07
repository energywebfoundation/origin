import {
  useAllBlockchainCertificates,
  useFetchAllDevices,
} from '@energyweb/origin-ui-user-data';
import { useClaimsTableLogic } from '@energyweb/origin-ui-user-logic';

export const useAdminClaimsPageEffects = () => {
  const {
    blockchainCertificates,
    isLoading: areCertificatesLoading,
  } = useAllBlockchainCertificates();
  const { allDevices, isLoading: areDeviceLoading } = useFetchAllDevices();

  const isLoading = areDeviceLoading || areCertificatesLoading;

  const tableProps = useClaimsTableLogic({
    certificates: blockchainCertificates,
    allDevices,
    isLoading,
  });

  return tableProps;
};
