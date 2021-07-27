import { useApiMyTrades } from '@energyweb/origin-ui-exchange-data';
import { useLogicMyTrades } from '@energyweb/origin-ui-exchange-logic';

export const useMyTradesPageEffects = () => {
  const { myTrades: trades, isLoading: loading } = useApiMyTrades();

  const tableData = useLogicMyTrades({
    trades,
    loading,
  });

  return {
    tableData,
  };
};
