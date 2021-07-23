import { useAccountBalanceControllerGet } from '@energyweb/exchange-react-query-client';

export const useApiAllExchangeCertificates = () => {
  const { data, isLoading } = useAccountBalanceControllerGet();
  const exchangeCertificates = data?.available || [];
  return { exchangeCertificates, isLoading };
};
