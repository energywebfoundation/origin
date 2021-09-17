import { useBlockchainPropertiesControllerGet } from '@energyweb/issuer-irec-api-react-query-client';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import {
  Certificate,
  Contracts,
  IBlockchainProperties,
} from '@energyweb/issuer';

export const useGetBlockchainCertificateHandler = () => {
  const {
    data: blockchainProperties,
    isLoading,
  } = useBlockchainPropertiesControllerGet();

  const web3Interface = useWeb3React<Web3Provider>();
  const { library: web3 } = web3Interface;

  const getBlockchainCertificate = async (id: number) => {
    const configuration: IBlockchainProperties = {
      web3,
      registry: Contracts.factories.RegistryExtendedFactory.connect(
        blockchainProperties?.registry,
        web3
      ),
      issuer: Contracts.factories.IssuerFactory.connect(
        blockchainProperties?.issuer,
        web3
      ),
      activeUser: web3.getSigner(),
    };

    const certificate = new Certificate(id, configuration);
    await certificate.sync();
    return certificate;
  };

  return { getBlockchainCertificate, isLoading };
};
