import { originBackendClient } from '@energy-web/origin-ui-api-clients';

export const useApiAdminFetchUsers = () => {
  const {
    isLoading,
    error,
    isError,
    isSuccess,
    status,
    data,
  } = originBackendClient.useAdminControllerGetUsers();

  return {
    status,
    isLoading,
    isSuccess,
    isError,
    error,
    data,
  };
};
