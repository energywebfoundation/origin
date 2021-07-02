import React, { createContext, ReactNode, useContext } from 'react';
import { useBlockchainProviderEffects } from './BlockchainProvider.effects';
import { assertHasContext } from '@energyweb/origin-ui-utils';
import {
  AccountBalanceDTO,
  AccountDTO,
} from '@energyweb/exchange-react-query-client';
import { BlockchainPropertiesDTO } from '@energyweb/issuer-irec-api-react-query-client';
import { providers, Signer } from 'ethers';

type BlockchainProviderProps = {
  children: ReactNode;
};
interface IBlockchainContextState {
  web3ProviderInstance: providers.JsonRpcProvider;
  signer: Signer;
  accountList: string[];
  defaultAccount: string;
  exchangeDepositAccountAddress: string;
  backendAccountData: AccountDTO;
  blockchainProperties: BlockchainPropertiesDTO;
  backendAccountBalance: AccountBalanceDTO;
  blockchainPropertiesFetched: boolean;
}

const BlockchainContext = createContext<IBlockchainContextState>(null);

const BlockchainProvider = ({ children }: BlockchainProviderProps) => {
  const {
    web3ProviderInstance,
    signer,
    accountList,
    defaultAccount,
    backendAccountBalance,
    blockchainProperties,
    backendAccountData,
    blockchainPropertiesFetched,
  } = useBlockchainProviderEffects();
  return (
    <BlockchainContext.Provider
      value={{
        blockchainPropertiesFetched,
        backendAccountBalance,
        exchangeDepositAccountAddress: backendAccountData?.address,
        blockchainProperties,
        backendAccountData,
        web3ProviderInstance,
        signer,
        accountList,
        defaultAccount,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};

const useBlockchainWeb3Instance = (): providers.JsonRpcProvider => {
  assertHasContext(
    BlockchainContext,
    'useBlockchainWeb3Instance',
    'BlockchainContext'
  );
  return useContext<IBlockchainContextState>(BlockchainContext)
    .web3ProviderInstance;
};

const useBlockchainWeb3Signer = (): IBlockchainContextState['signer'] => {
  assertHasContext(
    BlockchainContext,
    'useBlockchainWeb3Signer',
    'BlockchainContext'
  );
  return useContext<IBlockchainContextState>(BlockchainContext).signer;
};

const useBlockchainAccountList = (): string[] => {
  assertHasContext(
    BlockchainContext,
    'useBlockchainAccountList',
    'BlockchainContext'
  );
  return useContext<IBlockchainContextState>(BlockchainContext).accountList;
};

const useBlockchainExchangeDepositAddress = (): string => {
  assertHasContext(
    BlockchainContext,
    'useBlockchainExchangeDepositAddress',
    'BlockchainContext'
  );
  return useContext<IBlockchainContextState>(BlockchainContext)
    .exchangeDepositAccountAddress;
};

const useBlockchainDefaultAccount = (): string => {
  assertHasContext(
    BlockchainContext,
    'useBlockchainDefaultAccount',
    'BlockchainContext'
  );
  return useContext<IBlockchainContextState>(BlockchainContext).defaultAccount;
};

export {
  BlockchainProvider,
  useBlockchainWeb3Instance,
  useBlockchainWeb3Signer,
  useBlockchainAccountList,
  useBlockchainDefaultAccount,
  useBlockchainExchangeDepositAddress,
};
