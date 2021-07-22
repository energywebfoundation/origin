import { useEffect, useState } from 'react';
import axios from 'axios';

export const useAuthProviderEffects = (initialState: string) => {
  const [token, setToken] = useState<string>(initialState);

  useEffect(() => {
    const interceptorId = axios.interceptors.request.use((config) => ({
      ...config,
      headers: token
        ? {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          }
        : config.headers,
    }));

    return () => {
      axios.interceptors.request.eject(interceptorId);
    };
  }, [token]);

  return { token, setToken };
};
