import React, { createContext, useContext, useReducer } from 'react';
import {
  orgModalsInitialState,
  orgModalsReducer,
  IOrganizationModalsStore,
  TOrganizationModalsAction,
} from './reducer';

const OrganizationModalsStore = createContext<IOrganizationModalsStore>(null);
const OrganizationModalsDispatch = createContext<
  React.Dispatch<TOrganizationModalsAction>
>(null);

export const OrganizationModalsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orgModalsReducer, orgModalsInitialState);

  return (
    <OrganizationModalsStore.Provider value={state}>
      <OrganizationModalsDispatch.Provider value={dispatch}>
        {children}
      </OrganizationModalsDispatch.Provider>
    </OrganizationModalsStore.Provider>
  );
};

export const useOrgModalsStore = () => {
  return useContext(OrganizationModalsStore);
};

export const useOrgModalsDispatch = () => {
  return useContext(OrganizationModalsDispatch);
};
