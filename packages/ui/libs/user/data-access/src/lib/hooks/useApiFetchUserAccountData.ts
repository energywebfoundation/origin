import { useAuthIsAuthenticated } from '@energy-web/origin-ui-api-clients';
import { useUserControllerMe } from '@energyweb/origin-backend-react-query-client';

export const useApiAdminFetchUserAccountData = () => {
  const isAuthenticated = useAuthIsAuthenticated();
  const {
    isFetching,
    isFetched,
    error,
    isError,
    isSuccess,
    status,
    data,
  } = useUserControllerMe({
    enabled: isAuthenticated,
  });

  return {
    status,
    isFetching,
    isFetched,
    isSuccess,
    isError,
    error,
    data,
  };
};
