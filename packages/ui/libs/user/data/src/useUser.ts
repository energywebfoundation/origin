import { useUserControllerMe } from '@energyweb/origin-backend-react-query-client';
import {
  getAuthenticationToken,
  removeAuthenticationToken,
} from '@energyweb/origin-ui-shared-state';
import axios from 'axios';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router';

export const useUser = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const clearUser = () => {
    const token = getAuthenticationToken();
    if (token) {
      removeAuthenticationToken();
      axios.defaults.headers.common['Authorization'] = undefined;
      queryClient.clear();
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
