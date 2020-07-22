import { Injectable, CanActivate, ExecutionContext, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IUserWithRelationsIds, UserStatus } from '@energyweb/origin-backend-core';

@Injectable()
export class NotDeletedUserGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user as IUserWithRelationsIds;
        const _user = user as IUserWithRelationsIds;

        if (_user.status === UserStatus.Deleted) {
            throw new HttpException(
                `Only not deleted users can perform this action. Your status is ${
                    UserStatus[_user.status]
                }`,
                412
            );
        }

        return true;
    }
}
