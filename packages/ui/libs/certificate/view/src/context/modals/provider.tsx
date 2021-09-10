import React, { createContext, useContext, useReducer } from 'react';
import { FC } from 'react';
import {
  CertificateModalsInitialState,
  CertificateModalsReducer,
} from './reducer';
import { ICertificateModalsStore, TCertificateModalsAction } from './types';

const CertificateModalsStore = createContext<ICertificateModalsStore>(null);
const CertificateModalsDispatch =
  createContext<React.Dispatch<TCertificateModalsAction>>(null);

export const CertificateModalsProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(
    CertificateModalsReducer,
    CertificateModalsInitialState
  );

  return (
    <CertificateModalsStore.Provider value={state}>
      <CertificateModalsDispatch.Provider value={dispatch}>
        {children}
      </CertificateModalsDispatch.Provider>
    </CertificateModalsStore.Provider>
  );
};

export const useCertificateModalsStore = () => {
  return useContext(CertificateModalsStore);
};

export const useCertificateModalsDispatch = () => {
  return useContext(CertificateModalsDispatch);
};
