import { Injectable, CanActivate, ExecutionContext, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserStatus } from '@energyweb/origin-backend-core';

@Injectable()
export class NotDeletedUserGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const { user } = context.switchToHttp().getRequest();

        if (user.status === UserStatus.Deleted) {
            throw new HttpException(
                `Only not deleted users can perform this action. Your status is ${
                    UserStatus[user.status]
                }`,
                403
            );
        }

        return true;
    }
}
