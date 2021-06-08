import {
  getUserControllerMeQueryKey,
  useUserControllerMe,
  userControllerMe,
} from '@energyweb/origin-backend-react-query-client';
import {
  getAuthenticationToken,
  removeAuthenticationToken,
} from '@energyweb/origin-ui-shared-state';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router';

export const useUser = () => {
  const queryClient = useQueryClient();
  const userQueryKey = getUserControllerMeQueryKey();
  const navigate = useNavigate();

  const clearUser = () => {
    const token = getAuthenticationToken();
    if (token) {
      removeAuthenticationToken();
      queryClient.removeQueries(userQueryKey);
      navigate('/');
    }
  };

  const tokenExists = Boolean(getAuthenticationToken());

  const {
    data,
    isLoading: userLoading,
    isSuccess,
  } = useUserControllerMe({
    enabled: tokenExists,
  });

  const logout = () => clearUser();

  const user = data || null;
  const isAuthenticated = Boolean(tokenExists && isSuccess);

  return {
    user,
    userLoading,
    isAuthenticated,
    logout,
  };
};
