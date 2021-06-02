import { useAccountControllerGetAccount } from '@energyweb/exchange-react-query-client';
import { useAuthIsAuthenticated } from '@energyweb/origin-ui-react-query-providers';

export const useApiFetchUserAccountData = (refetchInterval?: number) => {
  const isAuthenticated = useAuthIsAuthenticated();
  const { isLoading, error, isError, isSuccess, status, data } =
    useAccountControllerGetAccount({
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
