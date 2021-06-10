import { useTradeControllerGetAll } from '@energyweb/exchange-irec-react-query-client';
import { useAuthIsAuthenticated } from '@energyweb/origin-ui-react-query-providers';

export const useApiFetchMyTrades = (fetchInterval?: number) => {
  const isAuthenticated = useAuthIsAuthenticated();
  const { isLoading, data, isFetched } = useTradeControllerGetAll({
    enabled: isAuthenticated,
    refetchInterval: fetchInterval,
    refetchIntervalInBackground: Boolean(fetchInterval),
  });

  return {
    isFetched,
    isLoading,
    data,
  };
};
