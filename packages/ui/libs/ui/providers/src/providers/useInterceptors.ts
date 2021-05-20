import axios, { AxiosRequestConfig } from 'axios';

export const useAxiosInterceptors = () => {
  const token = localStorage.getItem('AUTHENTICATION_TOKEN');

  axios.interceptors.request.use(
    (config: AxiosRequestConfig): AxiosRequestConfig => {
      config.baseURL = process.env.NX_BACKEND_URL;
      config.headers.Authorization = `Bearer ${token}`;

      return config;
    }
  );

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      return Promise.reject(error);
    }
  );
};
