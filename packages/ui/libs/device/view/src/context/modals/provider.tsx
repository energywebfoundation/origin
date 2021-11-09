import React, { createContext, useContext, useReducer } from 'react';
import { FC } from 'react';
import { deviceModalsInitialState, deviceModalsReducer } from './reducer';
import { IDeviceModalsStore, TDeviceModalsAction } from './types';

const DeviceModalsStore = createContext<IDeviceModalsStore>(null);
const DeviceModalsDispatch =
  createContext<React.Dispatch<TDeviceModalsAction>>(null);

export const DeviceModalsProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(
    deviceModalsReducer,
    deviceModalsInitialState
  );

  return (
    <DeviceModalsStore.Provider value={state}>
      <DeviceModalsDispatch.Provider value={dispatch}>
        {children}
      </DeviceModalsDispatch.Provider>
    </DeviceModalsStore.Provider>
  );
};

export const useDeviceModalsStore = () => {
  return useContext(DeviceModalsStore);
};

export const useDeviceModalsDispatch = () => {
  return useContext(DeviceModalsDispatch);
};
