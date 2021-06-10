import { useSupplyControllerFindAll } from '@energyweb/exchange-react-query-client';

export const useApiFetchSupply = (fetchInterval?: number) => {
  const { isLoading, data, isFetched } = useSupplyControllerFindAll({
    refetchInterval: fetchInterval,
    refetchIntervalInBackground: Boolean(fetchInterval),
  });

  return {
    isFetched,
    isLoading,
    data,
  };
};
