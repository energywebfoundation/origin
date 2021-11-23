import { useUserControllerMe } from '@energyweb/origin-backend-react-query-client';
import {
  getAuthenticationToken,
  removeAuthenticationToken,
} from '@energyweb/origin-ui-shared-state';
import axios from 'axios';
import { useCallback, useMemo } from 'react';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router';

export const useUser = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const logout = useCallback(() => {
    const token = getAuthenticationToken();
    if (token) {
      removeAuthenticationToken();
      axios.defaults.headers.common['Authorization'] = undefined;
      queryClient.clear();
      navigate('/');
    }
  }, []);

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
    logout,
  };
};
