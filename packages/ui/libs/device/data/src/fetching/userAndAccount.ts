import { useUserControllerMe } from '@energyweb/origin-backend-react-query-client';
import { useAccountControllerGetAccount } from '@energyweb/exchange-react-query-client';

export const useApiUserAndAccount = () => {
  const { data: userData, isLoading: userLoading } = useUserControllerMe();
  const {
    data: account,
    isLoading: exchangeAddressLoading,
  } = useAccountControllerGetAccount();

  const exchangeDepositAddress = account?.address || '';
  const user = userData || null;
  const isLoading = userLoading || exchangeAddressLoading;

  return {
    user,
    isLoading,
    exchangeDepositAddress,
  };
};
