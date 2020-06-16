import { IUserWithRelationsIds, Role, UserStatus } from '@energyweb/origin-backend-core';
import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ActiveUserGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<Role[]>('roles', context.getHandler());
        if (!roles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user as IUserWithRelationsIds;
        const _user = user as IUserWithRelationsIds;

        if (_user.status !== UserStatus.Active) {
            throw new HttpException(
                `Only active users can perform this action. Your status is ${
                    UserStatus[_user.status]
                }`,
                412
            );
        }

        return true;
    }
}
