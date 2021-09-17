import { CertificateDTO } from '@energyweb/issuer-irec-api-react-query-client';
import {
  useCachedBlockchainCertificates,
  useCachedAllFuelTypes,
  useCachedAllDevices,
  useDepositCertificateHandler,
} from '@energyweb/origin-ui-certificate-data';
import { useDepositActionLogic } from '@energyweb/origin-ui-certificate-logic';
import { useTransactionPendingDispatch } from '../../../context';

export const useDepositActionEffects = (
  selectedIds: CertificateDTO['id'][],
  resetIds: () => void
) => {
  const blockchainCertificates = useCachedBlockchainCertificates();
  const allDevices = useCachedAllDevices();
  const allFuelTypes = useCachedAllFuelTypes();
  const setTxPending = useTransactionPendingDispatch();

  const { depositHandler, isLoading } = useDepositCertificateHandler(
    resetIds,
    setTxPending
  );

  const actionLogic = useDepositActionLogic({
    selectedIds,
    blockchainCertificates,
    allDevices,
    allFuelTypes,
  });

  return { ...actionLogic, depositHandler, isLoading };
};
