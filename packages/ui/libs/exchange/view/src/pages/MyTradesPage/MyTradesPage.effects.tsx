import {
  useApiMyTrades,
  useApiUserAndAccount,
} from '@energyweb/origin-ui-exchange-data';
import {
  useLogicMyTrades,
  usePermissionsLogic,
} from '@energyweb/origin-ui-exchange-logic';

export const useMyTradesPageEffects = () => {
  const {
    user,
    exchangeDepositAddress,
    isLoading: userAndAccountLoading,
  } = useApiUserAndAccount();
  const { canAccessPage, requirementsProps } = usePermissionsLogic({
    user,
    exchangeDepositAddress,
  });
  const { myTrades: trades, isLoading: myTradesLoading } = useApiMyTrades();

  const loading = myTradesLoading || userAndAccountLoading;

  const tableData = useLogicMyTrades({
    trades,
    loading,
  });

  return {
    tableData,
    canAccessPage,
    requirementsProps,
  };
};
