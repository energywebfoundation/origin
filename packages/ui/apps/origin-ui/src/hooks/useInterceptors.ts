import {
  getAuthenticationToken,
  removeAuthenticationToken,
} from '@energyweb/origin-ui-shared-state';
import axios, { AxiosResponse } from 'axios';
import { useEffect } from 'react';

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
  useEffect(() => {
    const token = getAuthenticationToken();
    axios.defaults.baseURL = window.config.BACKEND_URL;
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const authToken = getAuthenticationToken();
      if (isUnauthorized(error?.response) && authToken) {
        removeAuthenticationToken();
        axios.defaults.headers.common['Authorization'] = undefined;
        window.location.reload();
      }
      return Promise.reject(error);
    }
  );
};
