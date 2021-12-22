import { useUserControllerMe } from '@energyweb/origin-backend-react-query-client';
import { getAuthenticationToken } from '@energyweb/origin-ui-shared-state';
import { useMemo } from 'react';

export const useUser = () => {
  const tokenExists = Boolean(getAuthenticationToken());

  const {
    data,
    isLoading: userLoading,
    isSuccess,
  } = useUserControllerMe({
    query: {
      enabled: tokenExists,
    },
  });

  const user = data || null;
  const isAuthenticated = useMemo(
    () => Boolean(tokenExists && isSuccess),
    [tokenExists, isSuccess]
  );

  return {
    user,
    userLoading,
    isAuthenticated,
  };
};
