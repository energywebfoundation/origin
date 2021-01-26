import { BlockchainAccountType, IBlockchainAccount, IUser } from '@energyweb/origin-backend-core';

export const getBlockchainAccount = (user: IUser): IBlockchainAccount =>
    user.blockchainAccounts.find((account) => account.type === BlockchainAccountType.User);

export const getExchangeAccount = (user: IUser): IBlockchainAccount =>
    user.blockchainAccounts.find((account) => account.type === BlockchainAccountType.User);
