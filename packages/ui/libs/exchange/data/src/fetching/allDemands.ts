import { useDemandControllerGetAll } from '@energyweb/exchange-irec-react-query-client';
import { DemandStatus } from '@energyweb/utils-general';

export const useApiAllDemands = () => {
  const { data, isLoading } = useDemandControllerGetAll();

  const allDemands = data?.filter(
    (demand) => demand.status !== DemandStatus.ARCHIVED
  );

  return { allDemands, isLoading };
};
