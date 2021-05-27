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
            return !!request.user?.organization?.blockchainAccountAddress;
        } catch (e) {
            throw new PreconditionFailedException(e.message);
        }
    }
}
