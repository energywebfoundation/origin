import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getHighestPriorityBlockchainAccount } from '@energyweb/origin-backend-core';

export const BlockchainAccountsDecorator = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();

        try {
            return getHighestPriorityBlockchainAccount(request.user);
        } catch (e) {
            return null;
        }
    }
);
