import React, { createContext, useContext } from 'react';
import { FC } from 'react';

export type DeviceEnvVariables = {
  googleMapsApiKey: string;
  smartMeterId: string;
};

const DeviceAppEnv = createContext<DeviceEnvVariables>(null);

interface DeviceAppEnvProviderProps {
  variables: DeviceEnvVariables;
}

export const DeviceAppEnvProvider: FC<DeviceAppEnvProviderProps> = ({
  variables,
  children,
}) => {
  return (
    <DeviceAppEnv.Provider value={variables}>{children}</DeviceAppEnv.Provider>
  );
};

export const useDeviceAppEnv = () => {
  return useContext(DeviceAppEnv);
};
