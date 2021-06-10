import { useApiAdminFetchUsers } from '@energyweb/origin-ui-user-data-access';
import { UserDTO } from '../api-clients/react-query/origin-backend';

export const useExchangeViewMarketPageEffects = () => {
  const { data, isLoading } = useApiAdminFetchUsers();
  return { data, isLoading };
};
