import { useEffect, useState } from 'react';
import { AXIOS_INSTANCE } from '../api/mutator/custom-mutator';

export const useAuthProviderEffects = (initialState: string) => {
  const [token, setToken] = useState<string>(initialState);

  useEffect(() => {
    const interceptorId = AXIOS_INSTANCE.interceptors.request.use((config) => ({
      ...config,
      headers: token
        ? {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          }
        : config.headers,
    }));

    return () => {
      AXIOS_INSTANCE.interceptors.request.eject(interceptorId);
    };
  }, [token]);

  return { token, setToken };
};
