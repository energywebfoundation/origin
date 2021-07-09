import {
  useCachedBlockchainCertificates,
  useCachedAllFuelTypes,
  useCachedMyDevices,
  useDepositCertificateHandler,
} from '@energyweb/origin-ui-certificate-data';
import { useDepositActionLogic } from '@energyweb/origin-ui-certificate-logic';

export const useDepositActionEffects = <Id>(
  selectedIds: Id[],
  resetIds: () => void
) => {
  const blockchainCertificates = useCachedBlockchainCertificates();
  const myDevices = useCachedMyDevices();
  const allFuelTypes = useCachedAllFuelTypes();

  const { depositHandler, isLoading } = useDepositCertificateHandler(resetIds);

  const actionLogic = useDepositActionLogic({
    selectedIds,
    blockchainCertificates,
    myDevices,
    allFuelTypes,
  });

  return { ...actionLogic, depositHandler, isLoading };
};
