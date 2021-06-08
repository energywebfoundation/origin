import {
  UserDTO,
  UserStatus,
} from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useEffect, useMemo, useState } from 'react';
import { ethers, Signer } from 'ethers';
import {
  useApiFetchUserAccountData,
  useUser,
} from '@energyweb/origin-ui-user-data';
import { useApiFetchUserAccountBalanceData } from '@energyweb/origin-ui-user-data';
import { useApiFetchUserBlockchainPropertiesData } from '@energyweb/origin-ui-user-data';
import { useQueryClient } from 'react-query';
import {
  getAccountBalanceControllerGetQueryKey,
  getAccountControllerGetAccountQueryKey,
} from '@energyweb/exchange-react-query-client';
import { BlockchainPropertiesDTO } from '@energyweb/issuer-api-react-query-client';

const checkBlockchainNetwork = (
  user: UserDTO,
  blockchainProperties: BlockchainPropertiesDTO
) => {
  // @ts-ignore
  const ethereumProvider = window.ethereum;
  if (user && user.status === UserStatus.Active && ethereumProvider) {
    const metamaskNetId = ethereumProvider.networkVersion;
    if (
      blockchainProperties?.netId !== 1337 &&
      blockchainProperties?.netId !== Number(metamaskNetId)
    ) {
      showNotification(
        `You are connected to the wrong blockchain. ${checkNetworkName(
          blockchainProperties?.netId
        )}`,
        NotificationTypeEnum.Error
      );
    }
  }
};

enum OriginPrimaryNetworksEnum {
  volta = 73799,
  ewc = 246,
}

export const checkNetworkName = (netId: OriginPrimaryNetworksEnum) => {
  switch (netId) {
    case OriginPrimaryNetworksEnum.volta:
      return 'Please connect to Volta network.';
    case OriginPrimaryNetworksEnum.ewc:
      return 'Please connect to Energy Web Chain network.';
    default:
      return `Please connect to blockchain network with ${netId} id.`;
  }
};

export const useBlockchainProviderEffects = () => {
  const { user } = useUser();

  const queryClient = useQueryClient();
  useEffect(() => {
    if (user) {
      queryClient.invalidateQueries([
        getAccountControllerGetAccountQueryKey(),
        getAccountBalanceControllerGetQueryKey(),
      ]);
    }
  }, [user]);

  const [accounts, setAccounts] = useState<string[]>([]);
  const { data: blockchainProperties, isFetched: blockchainPropertiesFetched } =
    useApiFetchUserBlockchainPropertiesData();

  let web3ProviderInstance: ethers.providers.JsonRpcProvider = null;
  const envWeb3 = process.env.NX_WEB3;
  const blockchainProvider = (window as any).ethereum;
  // const web3ProviderInstance = new ethers.providers.Web3Provider(
  //   blockchainProvider
  // );

  if (blockchainProvider) {
    web3ProviderInstance = new ethers.providers.Web3Provider(
      blockchainProvider
    );
    try {
      const requestAccAccess = async () => {
        await blockchainProvider.enable();
      };
      requestAccAccess();
    } catch (error) {
      console.error({ metaMaskError: error });
    }
  } else if ((window as any).web3) {
    web3ProviderInstance = new ethers.providers.Web3Provider(
      (window as any).web3.currentProvider
    );
  } else if (envWeb3) {
    web3ProviderInstance = new ethers.providers.JsonRpcProvider(envWeb3);
  }

  // blockchainProvider.enable();
  checkBlockchainNetwork(user, blockchainProperties);

  const { data: backendAccountData } = useApiFetchUserAccountData();
  const { data: backendAccountBalance } = useApiFetchUserAccountBalanceData();

  useEffect(() => {
    web3ProviderInstance.listAccounts().then((value) => {
      setAccounts(value);
    });
    // blockchainProvider?.on('accountsChanged', (accounts: string[]) => {
    //   setAccounts(accounts);
    // });
  }, []);

  return useMemo(
    () => ({
      get signer(): Signer {
        return web3ProviderInstance.getSigner();
      },
      blockchainProperties,
      blockchainPropertiesFetched,
      accountList: accounts,
      backendAccountData,
      backendAccountBalance,
      web3ProviderInstance,
      get defaultAccount() {
        return accounts[0];
      },
    }),
    [
      backendAccountData,
      backendAccountBalance,
      web3ProviderInstance,
      accounts,
      blockchainProperties,
    ]
  );
};
