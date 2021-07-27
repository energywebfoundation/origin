import { useDemandControllerGetAll } from '@energyweb/exchange-irec-react-query-client';

export const useApiAllDemands = () => {
  const { data: allDemands, isLoading } = useDemandControllerGetAll();

  return { allDemands, isLoading };
};
