import { useAccountBalanceControllerGet } from '@energyweb/exchange-react-query-client';
import { useAuthIsAuthenticated } from '@energyweb/origin-ui-react-query-providers';

export const useApiFetchUserAccountBalanceData = (refetchInterval?: number) => {
  const isAuthenticated = useAuthIsAuthenticated();
  const { isLoading, error, isError, isSuccess, status, data } =
    useAccountBalanceControllerGet({
      enabled: isAuthenticated,
      refetchInterval,
      refetchIntervalInBackground: Boolean(refetchInterval),
    });

  return {
    status,
    isLoading,
    isSuccess,
    isError,
    error,
    data,
  };
};
