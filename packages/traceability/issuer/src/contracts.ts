import RegistryJSON from '../build/contracts/Registry.json';
import IssuerJSON from '../build/contracts/Issuer.json';

import { IssuerFactory } from './ethers/IssuerFactory';
import { RegistryFactory } from './ethers/RegistryFactory';

const factories = { IssuerFactory, RegistryFactory };

export { migrateIssuer, migrateRegistry } from './migrate';
export { RegistryJSON, IssuerJSON, factories };
