import { useUserControllerGet } from '@energyweb/origin-backend-react-query-client';

export const useAdminGetUser = (id: string) => {
  const { data: user, isLoading } = useUserControllerGet(parseInt(id));

  return { user, isLoading };
};
