import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { IUser, UserLoginReturnData, Role, LoggedInUser } from '@energyweb/origin-backend-core';

import { UserService } from '../pods/user/user.service';

export interface IJWTPayload {
    id?: number;
    did?: string;
    email?: string;
    verifiedRoles?: { name: string; nameSpace: string }[];
}

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) {}

    async validateUser(email: string, unencryptedPassword: string) {
        const user = await this.userService.getUserAndPasswordByEmail(email);

        if (user && bcrypt.compareSync(unencryptedPassword, user.password)) {
            return this.userService.findById(user.id);
        }

        return null;
    }

    async login(user: Omit<IUser, 'password'>): Promise<UserLoginReturnData> {
        const payload: IJWTPayload = { email: user.email, id: user.id };

        return {
            accessToken: this.jwtService.sign(payload)
        };
    }

    /** TODO: this is a simulation of logging in with the passport-did-auth LoginStrategy
     *    parked until https://energyweb.atlassian.net/browse/SWTCH-949 is solved
     */

    async loginDid(user: Omit<IUser, 'password'>): Promise<UserLoginReturnData> {
        const loggedInUser = new LoggedInUser(user);

        const rights: { name: string; nameSpace: string }[] = [];

        Object.values(Role).forEach((role: Role) => {
            if (loggedInUser.hasRole(role)) {
                const roleName = Role[role].toString();
                rights.push({ name: roleName, nameSpace: `${roleName}.bogus.iat.ewc` });
            }
        });

        const payload: IJWTPayload = {
            email: user.email,
            id: user.id,
            //TODO: DID - this is going to be provided by passport-did-auth LoginStrategy
            verifiedRoles: rights
        };

        return {
            accessToken: this.jwtService.sign(payload)
        };
    }
}
