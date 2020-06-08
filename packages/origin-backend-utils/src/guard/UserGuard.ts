import { IUserWithRelationsIds, Role, Status } from '@energyweb/origin-backend-core';
import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class UserGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<Role[]>('roles', context.getHandler());
        if (!roles) {
            return true;
        }

        console.log('test');
        const request = context.switchToHttp().getRequest();
        const user = request.user as IUserWithRelationsIds;
        const _user = user as IUserWithRelationsIds;
        if (_user.status === Status.Pending) {
            throw new HttpException(
                `Only active users can perform this action. Your status is ${Status[_user.status]}`,
                412
            );
        }

        return true;
    }
}
