import { useBundleControllerGetAvailableBundles } from '@energyweb/exchange-react-query-client';
import { groupBy } from 'lodash';

export const useApiFetchBundles = (fetchInterval?: number) => {
  const { isLoading, data, isFetched } = useBundleControllerGetAvailableBundles(
    {
      refetchInterval: fetchInterval,
      refetchIntervalInBackground: Boolean(fetchInterval),
    }
  );

  data.map((bundle) => groupBy((el) => el));

  return {
    isFetched,
    isLoading,
    data,
  };
};
