import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
    IUser,
    BLOCKCHAIN_ACCOUNT_PRIORITY,
    IBlockchainAccount
} from '@energyweb/origin-backend-core';

const compare = (currentAccount: IBlockchainAccount, nextAccount: IBlockchainAccount) => {
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

export const BlockchainAccountsDecorator = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const { blockchainAccounts } = request.user as IUser;
        const orderedBlockchainAccounts = blockchainAccounts.sort(compare);

        return orderedBlockchainAccounts.length > 0 ? orderedBlockchainAccounts[0] : null;
    }
);
