import { useAdminControllerGetUsers } from '@energyweb/origin-backend-react-query-client';

export const useApiAdminFetchUsers = () => {
  const {
    isLoading,
    error,
    isError,
    isSuccess,
    status,
    data,
  } = useAdminControllerGetUsers();

  return {
    status,
    isLoading,
    isSuccess,
    isError,
    error,
    data,
  };
};
