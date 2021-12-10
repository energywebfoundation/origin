import {
  AccountDTO,
  getConnectionControllerGetMyAccountsQueryKey,
  useConnectionControllerGetMyAccounts,
} from '@energyweb/origin-organization-irec-api-react-query-client';
import { useQueryClient } from 'react-query';

export const useApiMyAccounts = () => {
  const queryClient = useQueryClient();
  const key = getConnectionControllerGetMyAccountsQueryKey();

  const isSingleAccountMode = /true/i.test(process.env.NX_SINGLE_ACCOUNT_MODE);
  const cachedData: AccountDTO[] | undefined = queryClient.getQueryData(key);

  const { data, isLoading } = useConnectionControllerGetMyAccounts({
    query: {
      staleTime: 1000000,
      enabled: !cachedData && isSingleAccountMode,
    },
  });

  const myAccounts = cachedData ?? data;

  return { myAccounts, isLoading };
};
