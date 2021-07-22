import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
} from 'react';

import {
  removeAuthenticationToken,
  setAuthenticationToken,
} from '@energyweb/origin-ui-shared-state';
import { useAuthProviderEffects } from './useAuthProviderEffects';

type TDispatchSetTokenValue = (token: string) => void;
type TDispatchLogoutUser = () => void;
type TAuthContextState = string;

type TAuthProviderProps = {
  children: ReactNode;
  initialState?: string | null;
};

export const AuthContext = createContext<TAuthContextState>(null);

const AuthDispatchSetTokenValueContext = createContext<TDispatchSetTokenValue>(
  null
);

const AuthDispatchLogoutUserContext = createContext<TDispatchLogoutUser>(null);

const AuthProvider = ({ children, initialState }: TAuthProviderProps) => {
  const { token, setToken } = useAuthProviderEffects(initialState);
  return (
    <AuthContext.Provider value={token}>
      <AuthDispatchSetTokenValueContext.Provider
        value={useCallback(
          (token) => {
            setToken(token);
            setAuthenticationToken(token);
          },
          [setToken]
        )}
      >
        <AuthDispatchLogoutUserContext.Provider
          value={useCallback(() => {
            removeAuthenticationToken();
            setToken(null);
          }, [setToken])}
        >
          {children}
        </AuthDispatchLogoutUserContext.Provider>
      </AuthDispatchSetTokenValueContext.Provider>
    </AuthContext.Provider>
  );
};

AuthProvider.displayName = 'AuthProvider';

const useAuthIsAuthenticated = (): boolean => {
  const isAuthenticated = useContext<string>(AuthContext);
  return Boolean(isAuthenticated);
};

const useAuthDispatchSetTokenValue = (): TDispatchSetTokenValue => {
  const context = useContext<TDispatchSetTokenValue | null>(
    AuthDispatchSetTokenValueContext
  );

  if (context === null) {
    throw new Error(
      '*useAuthDispatchSetTokenValue* must be used within a *AuthProvider*'
    );
  }
  return context;
};

const useAuthDispatchLogoutUser = (): TDispatchLogoutUser => {
  const context = useContext<TDispatchLogoutUser | null>(
    AuthDispatchLogoutUserContext
  );

  if (context === null) {
    throw new Error(
      '*useAuthDispatchSetTokenValue* must be used within a *AuthProvider*'
    );
  }
  return context;
};

export {
  AuthProvider,
  useAuthIsAuthenticated,
  useAuthDispatchSetTokenValue,
  useAuthDispatchLogoutUser,
};
