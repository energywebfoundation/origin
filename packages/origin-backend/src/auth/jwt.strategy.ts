import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser, Role } from '@energyweb/origin-backend-core';

import { UserService } from '../pods/user/user.service';
import { IJWTPayload } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject(ConfigService) configService: ConfigService,
        private readonly userService: UserService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET')
        });
    }

    async validate(payload: IJWTPayload): Promise<IUser> {
        let user;

        if (payload.verifiedRoles) {
            // TODO: find user record by another criteria in case of DID
            user = await this.userService.findByEmail(payload.email);
        } else {
            user = await this.userService.findByEmail(payload.email);
            return user;
        }

        if (!user) {
            return null;
        }

        /** TODO: filter out roles not included in ACCEPTED_ROLES env var passed to
         *    passport-did-auth LoginStrategy constructor
         */
        const roles: Role[] = payload.verifiedRoles
            .map((role) => role.name)
            .map((roleName: keyof typeof Role) => Role[roleName]);

        let rights = roles.reduce((acc, role) => {
            return acc | role;
        }, 0);

        user.rights = rights;

        return user;
    }
}
