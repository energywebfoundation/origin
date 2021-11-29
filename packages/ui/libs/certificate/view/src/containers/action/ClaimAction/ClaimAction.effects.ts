import { AccountAssetDTO } from '@energyweb/exchange-react-query-client';
import {
  useCachedExchangeCertificates,
  useCachedAllFuelTypes,
  useCachedAllDevices,
  useCachedUser,
  useClaimCertificateHandler,
} from '@energyweb/origin-ui-certificate-data';
import { useClaimActionLogic } from '@energyweb/origin-ui-certificate-logic';
import { useTransactionPendingDispatch } from '../../../context';

export const useClaimActionEffects = (
  selectedIds: AccountAssetDTO['asset']['id'][],
  resetIds: () => void
) => {
  const setTxPending = useTransactionPendingDispatch();
  const exchangeCertificates = useCachedExchangeCertificates();
  const allDevices = useCachedAllDevices();
  const allFuelTypes = useCachedAllFuelTypes();
  const user = useCachedUser();

  const withdrawalAddress = user?.organization?.blockchainAccountAddress;

  const withdrawHandler = useClaimCertificateHandler(
    withdrawalAddress,
    exchangeCertificates,
    resetIds,
    setTxPending
  );

  const actionLogic = useClaimActionLogic({
    selectedIds,
    exchangeCertificates,
    allDevices,
    allFuelTypes,
  });

  return { ...actionLogic, withdrawHandler };
};
