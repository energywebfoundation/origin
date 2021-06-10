import { useApiFetchBundles } from '@energyweb/origin-ui-exchange-data-access';

export const useExchangeBundlesPageEffects = () => {
  const { data, isLoading } = useApiFetchBundles();
  return { data, isLoading };
};
