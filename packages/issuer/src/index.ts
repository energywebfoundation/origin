import CommitmentSchema from '../schemas/Commitment.schema.json';
import * as Certificate from './blockchain-facade/Certificate';
import * as RequestIssue from './blockchain-facade/RequestIssue';
import * as Contracts from './contracts';

export { ICommitment } from './blockchain-facade/ICommitment';

export { Registry } from './wrappedContracts/Registry';
export { PublicIssuer } from './wrappedContracts/PublicIssuer';
export { PrivateIssuer } from './wrappedContracts/PrivateIssuer';

export * from './const';
export { migratePublicIssuer, migratePrivateIssuer, migrateRegistry } from './migrate';

export { RequestIssue, Certificate, CommitmentSchema, Contracts };
