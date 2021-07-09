import {
  useCachedBlockchainCertificates,
  useCachedAllFuelTypes,
  useCachedMyDevices,
  useRetireCertificateHandler,
} from '@energyweb/origin-ui-certificate-data';
import { useRetireActionLogic } from '@energyweb/origin-ui-certificate-logic';

export const useRetireActionEffects = <Id>(
  selectedIds: Id[],
  resetIds: () => void
) => {
  const blockchainCertificates = useCachedBlockchainCertificates();
  const myDevices = useCachedMyDevices();
  const allFuelTypes = useCachedAllFuelTypes();

  const { retireHandler, isLoading } = useRetireCertificateHandler(resetIds);

  const actionLogic = useRetireActionLogic({
    selectedIds,
    blockchainCertificates,
    myDevices,
    allFuelTypes,
  });

  return { ...actionLogic, retireHandler, isLoading };
};
