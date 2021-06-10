import { useApiAdminFetchUsers } from '@energyweb/origin-ui-user-data-access';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';

export const useExchangeBundlesPageEffects = () => {
  const { data, isLoading } = useApiAdminFetchUsers();
  return { data, isLoading };
};
