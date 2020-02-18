import OwnershipCommitmentSchema from '../schemas/OwnershipCommitment.schema.json';

import * as RequestIssue from './blockchain-facade/RequestIssue';
import * as Certificate from './blockchain-facade/Certificate';
import * as Contracts from './contracts';

export { IOwnershipCommitment } from './blockchain-facade/IOwnershipCommitment';
export { Registry } from './wrappedContracts/Registry';
export { Issuer } from './wrappedContracts/Issuer';

export * from './const';
export { migrateIssuer, migrateRegistry } from './migrate';

export { RequestIssue, Certificate, OwnershipCommitmentSchema, Contracts };
