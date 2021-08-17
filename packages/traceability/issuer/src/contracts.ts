import RegistryExtendedJSON from '../build/contracts/RegistryExtended.json';
import IssuerJSON from '../build/contracts/Issuer.json';
import PrivateIssuerJSON from '../build/contracts/PrivateIssuer.json';

import { Issuer__factory } from './ethers/factories/Issuer__factory';
import { RegistryExtended__factory } from './ethers/factories/RegistryExtended__factory';
import { PrivateIssuer__factory } from './ethers/factories/PrivateIssuer__factory';

const factories = {
    IssuerFactory: Issuer__factory,
    RegistryExtendedFactory: RegistryExtended__factory,
    PrivateIssuerFactory: PrivateIssuer__factory
};

export * from './migrate';
export { RegistryExtendedJSON, IssuerJSON, PrivateIssuerJSON, factories };
