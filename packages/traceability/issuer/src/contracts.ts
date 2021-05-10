import RegistryJSON from '../build/contracts/Registry.json';
import IssuerJSON from '../build/contracts/Issuer.json';
import PrivateIssuerJSON from '../build/contracts/PrivateIssuer.json';

import { Issuer__factory } from './ethers/factories/Issuer__factory';
import { Registry__factory } from './ethers/factories/Registry__factory';
import { PrivateIssuer__factory } from './ethers/factories/PrivateIssuer__factory';

const factories = {
    IssuerFactory: Issuer__factory,
    RegistryFactory: Registry__factory,
    PrivateIssuerFactory: PrivateIssuer__factory
};

export * from './migrate';
export { RegistryJSON, IssuerJSON, PrivateIssuerJSON, factories };
