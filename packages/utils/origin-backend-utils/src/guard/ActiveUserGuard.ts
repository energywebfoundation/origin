import { IUser, UserStatus } from '@energyweb/origin-backend-core';
import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class ActiveUserGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user as IUser;
        const _user = user as IUser;

        if (_user.status !== UserStatus.Active) {
            throw new HttpException(
                `Only active users can perform this action. Your status is ${_user.status}`,
                412
            );
        }

        return true;
    }
}
