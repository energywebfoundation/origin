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
