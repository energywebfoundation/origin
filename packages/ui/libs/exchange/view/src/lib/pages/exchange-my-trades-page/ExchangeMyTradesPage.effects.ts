import { useApiFetchMyTrades } from '@energyweb/origin-ui-exchange-data-access';
import { getConfiguration } from '@energyweb/origin-ui-shared-state';

export const useExchangeMyTradesPageEffects = () => {
  const { currencies } = getConfiguration();
  const defaultCurrency = (currencies && currencies[0]) ?? 'USD';

  const { data, isLoading, isFetched } = useApiFetchMyTrades(10000);
  const columns = {};
  return { data, isLoading, isFetched, columns };
};
