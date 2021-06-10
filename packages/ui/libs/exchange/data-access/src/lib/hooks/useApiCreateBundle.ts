import { useAuthIsAuthenticated } from '@energyweb/origin-ui-react-query-providers';
import {
  useBundleControllerCreateBundle,
  useBundleControllerGetAvailableBundles,
} from '@energyweb/exchange-react-query-client';

export const useApiCreateBundle = () => {
  const { isLoading, data } = useBundleControllerCreateBundle({});

  return {
    isLoading,
    data,
  };
};
