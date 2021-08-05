import { getAuthenticationToken } from '@energyweb/origin-ui-shared-state';
import axios from 'axios';

export const useAxiosInterceptors = () => {
  const token = getAuthenticationToken();

  axios.defaults.baseURL = process.env.NX_BACKEND_URL;
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      return Promise.reject(error);
    }
  );
};
