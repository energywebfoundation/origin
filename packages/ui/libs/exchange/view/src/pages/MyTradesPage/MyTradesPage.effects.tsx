import { useApiMyTrades } from '@energyweb/origin-ui-exchange-data';
import { useLogicMyTrades } from '@energyweb/origin-ui-exchange-logic';
import { usePermissions } from '@energyweb/origin-ui-utils';

export const useMyTradesPageEffects = () => {
  const { canAccessPage } = usePermissions();
  const { myTrades: trades, isLoading: loading } = useApiMyTrades();

  const tableData = useLogicMyTrades({
    trades,
    loading,
  });

  return {
    tableData,
    canAccessPage,
  };
};
