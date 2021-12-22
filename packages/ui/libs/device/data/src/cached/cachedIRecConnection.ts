import {
  getConnectionControllerGetMyConnectionQueryKey,
  ShortConnectionDTO,
} from '@energyweb/origin-organization-irec-api-react-query-client';
import { useQueryClient } from 'react-query';

export const useCachedIRecConnection = () => {
  const queryClient = useQueryClient();
  const iRecConnectionQueryKey =
    getConnectionControllerGetMyConnectionQueryKey();

  const iRecConnection: ShortConnectionDTO | undefined =
    queryClient.getQueryData(iRecConnectionQueryKey);

  return iRecConnection;
};
