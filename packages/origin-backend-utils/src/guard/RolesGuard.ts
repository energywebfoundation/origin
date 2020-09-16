import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IUser, LoggedInUser, Role } from '@energyweb/origin-backend-core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<Role[]>('roles', context.getHandler());
        if (!roles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user as IUser;
        const loggedInUser = new LoggedInUser(user);
        return roles.some((role) => loggedInUser.hasRole(role));
    }
}
