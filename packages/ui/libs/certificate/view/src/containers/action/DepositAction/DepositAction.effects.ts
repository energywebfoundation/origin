import {
  useCachedBlockchainCertificates,
  useCachedAllFuelTypes,
  useCachedAllDevices,
  useDepositCertificateHandler,
} from '@energyweb/origin-ui-certificate-data';
import { useDepositActionLogic } from '@energyweb/origin-ui-certificate-logic';

export const useDepositActionEffects = <Id>(
  selectedIds: Id[],
  resetIds: () => void
) => {
  const blockchainCertificates = useCachedBlockchainCertificates();
  const allDevices = useCachedAllDevices();
  const allFuelTypes = useCachedAllFuelTypes();

  const { depositHandler, isLoading } = useDepositCertificateHandler(resetIds);

  const actionLogic = useDepositActionLogic({
    selectedIds,
    blockchainCertificates,
    allDevices,
    allFuelTypes,
  });

  return { ...actionLogic, depositHandler, isLoading };
};
