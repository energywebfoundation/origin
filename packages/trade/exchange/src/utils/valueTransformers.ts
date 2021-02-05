import { ValueTransformer } from 'typeorm';
import BN from 'bn.js';

export const BNTransformer: ValueTransformer = {
    to: (entityValue: BN) => entityValue?.toString(10),
    from: (databaseValue: string): BN => new BN(databaseValue)
};
