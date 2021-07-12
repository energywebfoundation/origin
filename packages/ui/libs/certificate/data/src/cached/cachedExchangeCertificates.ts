import {
  AccountBalanceDTO,
  getAccountBalanceControllerGetQueryKey,
} from '@energyweb/exchange-react-query-client';
import { useQueryClient } from 'react-query';

export const useCachedExchangeCertificates = () => {
  const queryClient = useQueryClient();
  const exchangeCertificatesQueryKey = getAccountBalanceControllerGetQueryKey();

  const accountBalance = queryClient.getQueryData<AccountBalanceDTO>(
    exchangeCertificatesQueryKey
  );

  return accountBalance.available;
};
