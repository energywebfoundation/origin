import { useUserControllerMe } from '@energyweb/origin-backend-react-query-client';

export const useUserAccountPageEffects = () => {
  const { data: userAccountData, isLoading } = useUserControllerMe();

  return { userAccountData, isLoading };
};
