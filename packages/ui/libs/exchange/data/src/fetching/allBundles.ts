import { useBundleControllerGetAvailableBundles } from '@energyweb/exchange-react-query-client';

export const useApiAllBundles = () => {
  const {
    data: allBundles,
    isLoading,
  } = useBundleControllerGetAvailableBundles();

  return { allBundles, isLoading };
};
