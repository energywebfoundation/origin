import React, { createContext, useContext } from 'react';
import { FC } from 'react';

export type UserEnvVariables = {
  registrationMessage: string;
};

const UserAppEnv = createContext<UserEnvVariables>(null);

interface UserAppEnvProviderProps {
  variables: UserEnvVariables;
}

export const UserAppEnvProvider: FC<UserAppEnvProviderProps> = ({
  variables,
  children,
}) => {
  return (
    <UserAppEnv.Provider value={variables}>{children}</UserAppEnv.Provider>
  );
};

export const useUserAppEnv = () => {
  return useContext(UserAppEnv);
};
