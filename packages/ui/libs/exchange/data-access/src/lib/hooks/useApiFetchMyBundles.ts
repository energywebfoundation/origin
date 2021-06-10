import { useAuthIsAuthenticated } from '@energyweb/origin-ui-react-query-providers';
import {
  useBundleControllerGetAvailableBundles,
  useBundleControllerGetMyBundles,
} from '@energyweb/exchange-react-query-client';

export const useApiFetchMyBundles = (fetchInterval?: number) => {
  const isAuthenticated = useAuthIsAuthenticated();
  const { isLoading, data, isFetched } = useBundleControllerGetMyBundles({
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
