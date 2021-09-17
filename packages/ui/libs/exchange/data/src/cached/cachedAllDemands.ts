import {
  DemandDTO,
  getDemandControllerGetAllQueryKey,
} from '@energyweb/exchange-irec-react-query-client';
import { useQueryClient } from 'react-query';

export const useCachedAllDemands = () => {
  const queryClient = useQueryClient();
  const demandsQueryKey = getDemandControllerGetAllQueryKey();

  return queryClient.getQueryData<DemandDTO[]>(demandsQueryKey);
};
