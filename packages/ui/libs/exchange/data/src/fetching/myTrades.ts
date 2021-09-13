import {
  TradeDTO,
  useTradeControllerGetAll,
} from '@energyweb/exchange-irec-react-query-client';

export const useApiMyTrades = () => {
  const refetchInterval = 10000;
  const { data, isLoading } = useTradeControllerGetAll({
    query: { refetchInterval },
  });
  const myTrades = data ?? ([] as TradeDTO[]);

  return { myTrades, isLoading };
};
