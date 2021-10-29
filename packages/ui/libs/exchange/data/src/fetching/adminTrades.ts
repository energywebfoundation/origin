import {
  TradeDTO,
  useAdminTradeControllerGetAll,
} from '@energyweb/exchange-irec-react-query-client';

export const useApiAdminTrades = () => {
  const refetchInterval = 10000;
  const { data, isLoading } = useAdminTradeControllerGetAll({
    query: { refetchInterval },
  });
  const adminTrades = data ?? ([] as TradeDTO[]);

  return { adminTrades, isLoading };
};
