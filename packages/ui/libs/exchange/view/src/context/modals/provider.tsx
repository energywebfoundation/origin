import React, { createContext, useContext, useReducer } from 'react';
import { exchangeModalsInitialState, exchangeModalsReducer } from './reducer';
import { IExchangeModalsStore, TExchangeModalsAction } from './types';

const ExchangeModalsStore = createContext<IExchangeModalsStore>(null);
const ExchangeModalsDispatch =
  createContext<React.Dispatch<TExchangeModalsAction>>(null);

export const SupplyUpdateModalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(
    exchangeModalsReducer,
    exchangeModalsInitialState
  );

  return (
    <ExchangeModalsStore.Provider value={state}>
      <ExchangeModalsDispatch.Provider value={dispatch}>
        {children}
      </ExchangeModalsDispatch.Provider>
    </ExchangeModalsStore.Provider>
  );
};

export const useExchangeModalsStore = () => {
  return useContext(ExchangeModalsStore);
};

export const useExchangeModalsDispatch = () => {
  return useContext(ExchangeModalsDispatch);
};
