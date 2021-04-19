import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private configService: ConfigService) {}

    private matchRoles(roles: string[], verifiedRoles: string[]): boolean {
        // TODO: Replace with a more robust matching method.
        return roles.some((role) => verifiedRoles.some((verifiedRole) => verifiedRole === role));
    }

    canActivate(context: ExecutionContext): boolean {
        const ctx = GqlExecutionContext.create(context);
        const { req } = ctx.getContext();

        // Get roles from metadata
        const reflector: Reflector = new Reflector();
        const metaRoles = reflector.get<string[]>('roles', context.getHandler());

        // Get roles from ENV vars
        const roles = metaRoles.map((metaRole) => this.configService.get<string>(metaRole) || '');

        // Get user verified roles
        const verifiedRoles: string[] = req.user.verifiedRoles.map((role: any) => role.namespace);

        // Compare DID document roles vs ENV roles.
        return this.matchRoles(roles, verifiedRoles);
    }
}
