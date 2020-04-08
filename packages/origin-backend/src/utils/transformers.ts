import { ValueTransformer } from 'typeorm';
import { BigNumber, bigNumberify } from 'ethers/utils';

export const BigNumberTransformer: ValueTransformer = {
    to: (entityValue: BigNumber) => entityValue?.toString(),
    from: (databaseValue: string): BigNumber => bigNumberify(databaseValue)
};
