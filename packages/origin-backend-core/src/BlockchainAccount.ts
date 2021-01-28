import { IUser } from './User';

export enum BlockchainAccountType {
    User = 'User',
    Exchange = 'Exchange'
}

export const BLOCKCHAIN_ACCOUNT_PRIORITY = {
    [BlockchainAccountType.User]: 1,
    [BlockchainAccountType.Exchange]: 2
};

export interface IBlockchainAccount {
    address: string;
    type: BlockchainAccountType;
    signedMessage?: string;
}

export const sortByBlockchainAccountPriority = (
    currentAccount: IBlockchainAccount,
    nextAccount: IBlockchainAccount
): number => {
    const currentAccountPriority = BLOCKCHAIN_ACCOUNT_PRIORITY[currentAccount.type];
    const nextAccountPriority = BLOCKCHAIN_ACCOUNT_PRIORITY[nextAccount.type];

    if (currentAccountPriority < nextAccountPriority) {
        return -1;
    }
    if (currentAccountPriority > nextAccountPriority) {
        return 1;
    }

    return 0;
};

export const getHighestPriorityBlockchainAccount = (user: IUser): IBlockchainAccount => {
    const { blockchainAccounts } = user as IUser;
    const blockchainAccount = blockchainAccounts?.sort(sortByBlockchainAccountPriority)[0];

    if (!blockchainAccount) {
        throw Error('No blockchain accounts attached to user');
    }

    return blockchainAccount;
};
