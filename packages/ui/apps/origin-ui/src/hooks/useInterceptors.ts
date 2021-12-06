import {
  getAuthenticationToken,
  removeAuthenticationToken,
} from '@energyweb/origin-ui-shared-state';
import axios, { AxiosResponse } from 'axios';

declare global {
  interface Window {
    config: {
      BACKEND_URL: string;
      BLOCKCHAIN_EXPLORER_URL: string;
      SUPPORTED_NETWORK_IDS: string;
    };
  }
}

const isUnauthorized = (response: AxiosResponse) => response?.status === 401;

export const useAxiosDefaults = () => {
  const token = getAuthenticationToken();

  axios.defaults.baseURL = window.config.BACKEND_URL;
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (isUnauthorized(error?.response) && token) {
        removeAuthenticationToken();
        axios.defaults.headers.common['Authorization'] = undefined;
        window.location.reload();
      }
      return Promise.reject(error);
    }
  );
};
