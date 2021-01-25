import { getHighestPriorityBlockchainAccount } from '@energyweb/origin-backend-core';
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    PreconditionFailedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class BlockchainAccountGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();

        try {
            const blockchainAccount = getHighestPriorityBlockchainAccount(request.user);
            return !!blockchainAccount;
        } catch (e) {
            throw new PreconditionFailedException(e.message);
        }
    }
}
