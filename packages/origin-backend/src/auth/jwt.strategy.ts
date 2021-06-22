import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser, Role } from '@energyweb/origin-backend-core';

import { UserService } from '../pods/user/user.service';
import { IJWTPayload } from './auth.service';

const chainToOriginRoleNamesMap: { [index: string]: string } = Object.keys(Role)
    .map((key: keyof typeof Role) => Role[key])
    .filter((value) => typeof value === 'string')
    .reduce((acc: { [index: string]: string }, val) => {
        const originRoleName = val.toString();
        const chainRoleName = originRoleName.toLowerCase();
        acc[chainRoleName] = originRoleName;
        return acc;
    }, {});

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
            user = await this.userService.findByDid(payload.did);
        } else {
            user = await this.userService.findByEmail(payload.email);
            return user;
        }

        if (!user) {
            return null;
        }

        const roles: Role[] = payload.verifiedRoles
            .filter((role) => Role[chainToOriginRoleNamesMap[role.name] as keyof typeof Role]) // only roles that are recognized by the Origin
            .map((role) => chainToOriginRoleNamesMap[role.name])
            .map((roleName: keyof typeof Role) => Role[roleName]);

        // TODO: design and implement functionality onboarding users and organizaitons
        //  then, based on it implement filtering roles used to build user.rights value

        let rights = roles.reduce((acc, role) => {
            return acc | role;
        }, 0);

        if (user.rights !== rights) {
            // if DID roles are changed on Switchboard, the Origin DB record needs to be synchronized
            await this.userService.changeRole(user.id, ...roles);
        }

        user.rights = rights;

        return user;
    }
}
