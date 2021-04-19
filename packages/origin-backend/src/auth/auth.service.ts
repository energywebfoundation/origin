import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { IUser, UserLoginReturnData } from '@energyweb/origin-backend-core';
import { UserService } from '../pods/user/user.service';

export interface IJWTPayload {
    id: number;
    email: string;
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
}
