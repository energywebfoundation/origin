import RegistryJSON from '../build/contracts/Registry.json';
import IssuerJSON from '../build/contracts/Issuer.json';
import PrivateIssuerJSON from '../build/contracts/PrivateIssuer.json';

import { IssuerFactory } from './ethers/IssuerFactory';
import { RegistryFactory } from './ethers/RegistryFactory';
import { PrivateIssuerFactory } from './ethers/PrivateIssuerFactory';

const factories = { IssuerFactory, RegistryFactory, PrivateIssuerFactory };

export * from './migrate';
export { RegistryJSON, IssuerJSON, PrivateIssuerJSON, factories };
