import { usePermissions, Requirement } from '@energyweb/origin-ui-utils';
import { useUserControllerMe } from '@energyweb/origin-backend-react-query-client';
import { useAccountControllerGetAccount } from '@energyweb/exchange-react-query-client';

export const useApiPermissions = (config?: Requirement[]) => {
  const { data: userData, isLoading: userLoading } = useUserControllerMe();
  const { data: account, isLoading: exchangeAddressLoading } =
    useAccountControllerGetAccount();

  const exchangeDepositAddress = account?.address || '';
  const user = userData || null;
  const loading = userLoading || exchangeAddressLoading;

  const permissions = usePermissions({
    user,
    loading,
    exchangeDepositAddress,
    config,
  });

  return {
    permissions,
  };
};
