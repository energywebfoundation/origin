import { useAdminControllerGetUsers } from '@energyweb/origin-backend-react-query-client';

export const useApiAdminFetchUsers = () => {
  const {
    isLoading,
    error,
    isError,
    isSuccess,
    status,
    data: users,
  } = useAdminControllerGetUsers();

  return {
    status,
    isLoading,
    isSuccess,
    isError,
    error,
    users,
  };
};
