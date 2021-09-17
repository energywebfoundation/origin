import {
  useApiBidsAndAsks,
  useApiUserAndAccount,
} from '@energyweb/origin-ui-exchange-data';
import { usePermissionsLogic } from '@energyweb/origin-ui-exchange-logic';

export const useMyOrdersPageEffects = () => {
  const {
    user,
    exchangeDepositAddress,
    isLoading: userAndAccountLoading,
  } = useApiUserAndAccount();
  const { canAccessPage, requirementsProps } = usePermissionsLogic({
    user,
    exchangeDepositAddress,
  });
  const { bids, asks, isLoading: bidsAndAsksLoading } = useApiBidsAndAsks();

  const isLoading = bidsAndAsksLoading || userAndAccountLoading;

  return { bids, asks, isLoading, canAccessPage, requirementsProps };
};
