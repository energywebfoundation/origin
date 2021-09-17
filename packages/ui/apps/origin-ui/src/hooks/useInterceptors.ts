import { getAuthenticationToken } from '@energyweb/origin-ui-shared-state';
import axios from 'axios';

declare global {
  interface Window {
    config: {
      BACKEND_URL: string;
      BLOCKCHAIN_EXPLORER_URL: string;
      SUPPORTED_NETWORK_IDS: string;
    };
  }
}

export const useAxiosDefaults = () => {
  const token = getAuthenticationToken();

  axios.defaults.baseURL = window.config.BACKEND_URL;
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      return Promise.reject(error);
    }
  );
};
