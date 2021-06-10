import { useApiCreateBundle } from '@energyweb/origin-ui-exchange-data-access';

export const useExchangeCreateBundlePageEffects = () => {
  const { data, isLoading } = useApiCreateBundle();
  return { data, isLoading };
};
