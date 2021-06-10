import { useApiFetchSupply } from '@energyweb/origin-ui-exchange-data-access';

export const useExchangeSupplyPageEffects = () => {
  const { data, isLoading } = useApiFetchSupply();
  return { data, isLoading };
};
