import {
  useCachedExchangeCertificates,
  useCachedAllFuelTypes,
  useCachedMyDevices,
  useCachedUser,
  useWithdrawCertificateHandler,
} from '@energyweb/origin-ui-certificate-data';
import { useWithdrawActionLogic } from '@energyweb/origin-ui-certificate-logic';

export const useWithdrawActionEffects = <Id>(
  selectedIds: Id[],
  resetIds: () => void
) => {
  const exchangeCertificates = useCachedExchangeCertificates();
  const myDevices = useCachedMyDevices();
  const allFuelTypes = useCachedAllFuelTypes();
  const user = useCachedUser();

  const withdrawalAddress = user?.organization?.blockchainAccountAddress;

  const withdrawHandler = useWithdrawCertificateHandler(
    withdrawalAddress,
    exchangeCertificates,
    resetIds
  );

  const actionLogic = useWithdrawActionLogic({
    selectedIds,
    exchangeCertificates,
    myDevices,
    allFuelTypes,
  });

  return { ...actionLogic, withdrawHandler };
};
