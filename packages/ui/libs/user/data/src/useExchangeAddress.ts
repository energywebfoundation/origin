import { useAccountControllerGetAccount } from '@energyweb/exchange-react-query-client';

export const useExchangeAddress = () => {
  const { data, isLoading } = useAccountControllerGetAccount();

  const exchangeAddress = data?.address || '';

  return { exchangeAddress, isLoading };
};
