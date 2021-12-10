import {
  AccountDTO,
  getConnectionControllerGetMyAccountsQueryKey,
  useConnectionControllerGetMyAccounts,
} from '@energyweb/origin-organization-irec-api-react-query-client';
import { useQueryClient } from 'react-query';

type TUseApiMyAccounts = {
  enabled: boolean;
};

export const useApiMyAccounts = ({ enabled }: TUseApiMyAccounts) => {
  const queryClient = useQueryClient();
  const key = getConnectionControllerGetMyAccountsQueryKey();

  const cachedData: AccountDTO[] | undefined = queryClient.getQueryData(key);

  const { data, isLoading } = useConnectionControllerGetMyAccounts({
    query: {
      staleTime: 1000000,
      enabled: !cachedData && enabled,
    },
  });

  const myAccounts = cachedData ?? data;

  return { myAccounts, isLoading };
};
