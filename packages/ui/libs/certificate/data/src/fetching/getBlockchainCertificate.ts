import { useBlockchainPropertiesControllerGet } from '@energyweb/issuer-irec-api-react-query-client';
import { useWeb3 } from '@energyweb/origin-ui-web3';
import { IBlockchainProperties } from '@energyweb/issuer';
/*
  Using direct imports for now to lower the bundle size.
  The reason for missing default tree-shaking of @energyweb/issuer is the partial
  reliability of webpack tree-shaking in regards to CommonJS modules.
  Could be fixed after the release of Typescript v4.5.0+ and repo version update.
  It will introduce new "module" and "moduleResolution" options such as "node12" & "nodenext".
*/
import { RegistryExtended__factory as RegistryExtendedFactory } from '@energyweb/issuer/dist/js/src/ethers/factories/RegistryExtended__factory';
import { Issuer__factory as IssuerFactory } from '@energyweb/issuer/dist/js/src/ethers/factories/Issuer__factory';
import {
  Certificate,
  CertificateSchemaVersion,
} from '@energyweb/issuer/dist/js/src/blockchain-facade/Certificate';

export const useGetBlockchainCertificateHandler = () => {
  const { data: blockchainProperties, isLoading } =
    useBlockchainPropertiesControllerGet();

  const { web3 } = useWeb3();

  const getBlockchainCertificate = async (id: number) => {
    const configuration: IBlockchainProperties = {
      web3,
      registry: RegistryExtendedFactory.connect(
        blockchainProperties?.registry,
        web3
      ),
      issuer: IssuerFactory.connect(blockchainProperties?.issuer, web3),
      activeUser: web3.getSigner(),
    };

    const certificate = new Certificate(
      id,
      configuration,
      CertificateSchemaVersion.Latest
    );
    await certificate.sync();
    return certificate;
  };

  return { getBlockchainCertificate, isLoading };
};
