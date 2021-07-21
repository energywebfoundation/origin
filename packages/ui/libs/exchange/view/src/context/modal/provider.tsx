import React, { createContext, useContext, useReducer } from 'react';
import {
  supplyUpdateModalInitialState,
  supplyUpdateModalReducer,
} from './reducer';
import { ISupplyUpdateModalStore, TSupplyUpdateModalAction } from './types';

const SupplyUpdateModalStore = createContext<ISupplyUpdateModalStore>(null);
const SupplyUpdateModalDispatch =
  createContext<React.Dispatch<TSupplyUpdateModalAction>>(null);

export const SupplyUpdateModalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(
    supplyUpdateModalReducer,
    supplyUpdateModalInitialState
  );

  return (
    <SupplyUpdateModalStore.Provider value={state}>
      <SupplyUpdateModalDispatch.Provider value={dispatch}>
        {children}
      </SupplyUpdateModalDispatch.Provider>
    </SupplyUpdateModalStore.Provider>
  );
};

export const useSupplyUpdateModalStore = () => {
  return useContext(SupplyUpdateModalStore);
};

export const useSupplyUpdateModalDispatch = () => {
  return useContext(SupplyUpdateModalDispatch);
};
