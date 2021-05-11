import { providers, Signer } from 'ethers';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Registry } from '../ethers/Registry';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Issuer } from '../ethers/Issuer';
import { PrivateIssuer } from '../ethers/PrivateIssuer';

export interface IBlockchainProperties {
    web3: providers.FallbackProvider | providers.JsonRpcProvider;
    registry: Registry;
    issuer: Issuer;
    privateIssuer?: PrivateIssuer;
    activeUser?: Signer;
}

export interface IContractsLookup {
    registry: string;
    issuer: string;
    privateIssuer?: string;
}
