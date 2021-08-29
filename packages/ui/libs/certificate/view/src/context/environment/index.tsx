import React, { createContext, useContext, useState } from 'react';
import { FC } from 'react';

export type CertificateEnvVariables = {
  googleMapsApiKey: string;
  exchangeWalletPublicKey: string;
};

const CertificateAppEnv = createContext<CertificateEnvVariables>(null);

interface CertificateAppEnvProviderProps {
  variables: CertificateEnvVariables;
}

export const CertificateAppEnvProvider: FC<CertificateAppEnvProviderProps> = ({
  variables,
  children,
}) => {
  return (
    <CertificateAppEnv.Provider value={variables}>
      {children}
    </CertificateAppEnv.Provider>
  );
};

export const useCertificateAppEnv = () => {
  return useContext(CertificateAppEnv);
};
