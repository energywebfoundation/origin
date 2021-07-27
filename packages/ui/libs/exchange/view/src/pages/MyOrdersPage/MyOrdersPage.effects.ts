import { useApiBidsAndAsks } from '@energyweb/origin-ui-exchange-data';

export const useMyOrdersPageEffects = () => {
  const { bids, asks, isLoading } = useApiBidsAndAsks();

  return { bids, asks, isLoading };
};
