import {
  originBackendClient,
  useAuthIsAuthenticated,
} from '@energy-web/origin-ui-api-clients';

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
  } = originBackendClient.useUserControllerMe({
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
