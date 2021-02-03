import { providers, Signer } from 'ethers';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Registry } from '../ethers/Registry';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Issuer } from '../ethers/Issuer';

export interface IBlockchainProperties {
    web3: providers.FallbackProvider | providers.JsonRpcProvider;
    registry: Registry;
    issuer: Issuer;
    activeUser?: Signer;
}

export interface IContractsLookup {
    registry: string;
    issuer: string;
}
