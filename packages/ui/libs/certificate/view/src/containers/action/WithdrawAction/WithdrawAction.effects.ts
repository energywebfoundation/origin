import { AccountAssetDTO } from '@energyweb/exchange-react-query-client';
import {
  useCachedExchangeCertificates,
  useCachedAllFuelTypes,
  useCachedAllDevices,
  useCachedUser,
  useWithdrawCertificateHandler,
} from '@energyweb/origin-ui-certificate-data';
import { useWithdrawActionLogic } from '@energyweb/origin-ui-certificate-logic';
import { useTransactionPendingDispatch } from '../../../context';

export const useWithdrawActionEffects = (
  selectedIds: AccountAssetDTO['asset']['id'][],
  resetIds: () => void
) => {
  const setTxPending = useTransactionPendingDispatch();
  const exchangeCertificates = useCachedExchangeCertificates();
  const allDevices = useCachedAllDevices();
  const allFuelTypes = useCachedAllFuelTypes();
  const user = useCachedUser();

  const withdrawalAddress = user?.organization?.blockchainAccountAddress;

  const withdrawHandler = useWithdrawCertificateHandler(
    withdrawalAddress,
    exchangeCertificates,
    resetIds,
    setTxPending
  );

  const actionLogic = useWithdrawActionLogic({
    selectedIds,
    exchangeCertificates,
    allDevices,
    allFuelTypes,
  });

  return { ...actionLogic, withdrawHandler };
};
