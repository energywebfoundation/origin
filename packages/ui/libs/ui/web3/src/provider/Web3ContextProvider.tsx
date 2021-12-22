import React, { useContext } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3State } from '../state';
import { IWeb3Context } from './types';

const Web3Context = React.createContext<IWeb3Context>({
  connect: async ({}) => {},
  disconnect: async () => {},
});

export const Web3ContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { provider, adapter, account, chainId, connect, disconnect } =
    useWeb3State();

  const context: IWeb3Context = {
    connect,
    disconnect,
    account,
    chainId,
    web3: provider ? new Web3Provider(provider) : undefined,
    isActive:
      account !== undefined && chainId !== undefined && adapter !== undefined,
  };

  return (
    <Web3Context.Provider value={context}>{children}</Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  return useContext(Web3Context);
};
