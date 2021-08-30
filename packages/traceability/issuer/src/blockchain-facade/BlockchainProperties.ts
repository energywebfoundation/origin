import { providers, Signer } from 'ethers';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { RegistryExtended } from '../ethers/RegistryExtended';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Issuer } from '../ethers/Issuer';
import { PrivateIssuer } from '../ethers/PrivateIssuer';

export interface IBlockchainProperties {
    web3: providers.FallbackProvider | providers.JsonRpcProvider;
    registry: RegistryExtended;
    issuer: Issuer;
    privateIssuer?: PrivateIssuer;
    activeUser?: Signer;
}

export interface IContractsLookup {
    registry: string;
    issuer: string;
    privateIssuer?: string;
}
