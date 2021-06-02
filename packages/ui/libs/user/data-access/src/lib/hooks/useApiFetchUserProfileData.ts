import { useAuthIsAuthenticated } from '@energyweb/origin-ui-react-query-providers';

import {
  getUserControllerMeQueryKey,
  useUserControllerMe,
} from '@energyweb/origin-backend-react-query-client';
import { useQueryClient } from 'react-query';
import { useEffect } from 'react';

export const useApiFetchUserProfileData = (refreshTimestampToken: number) => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthIsAuthenticated();
  const { isFetching, isFetched, error, isError, isSuccess, status, data } =
    useUserControllerMe({
      enabled: isAuthenticated,
    });

  useEffect(() => {
    if (refreshTimestampToken) {
      const userQueryKey = getUserControllerMeQueryKey();
      queryClient.invalidateQueries(userQueryKey);
    }
  }, [refreshTimestampToken]);

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
