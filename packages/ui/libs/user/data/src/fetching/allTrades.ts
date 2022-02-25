import {
  TradeForAdminDTO,
  useTradeControllerGetAll,
} from '@energyweb/exchange-irec-react-query-client';

export const useApiAllTrades = () => {
  const refetchInterval = 10000;
  const { data, isLoading } = useTradeControllerGetAll({
    query: { refetchInterval },
  });

  const trades = (data as TradeForAdminDTO[]) ?? ([] as TradeForAdminDTO[]);

  return {
    trades,
    isLoading,
  };
};
