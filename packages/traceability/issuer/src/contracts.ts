import RegistryJSON from '../build/contracts/Registry.json';
import IssuerJSON from '../build/contracts/Issuer.json';

import { Issuer__factory } from './ethers/factories/Issuer__factory';
import { Registry__factory } from './ethers/factories/Registry__factory';

const factories = { IssuerFactory: Issuer__factory, RegistryFactory: Registry__factory };

export { migrateIssuer, migrateRegistry } from './migrate';
export { RegistryJSON, IssuerJSON, factories };
