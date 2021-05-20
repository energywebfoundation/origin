import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IUser } from '@energyweb/origin-backend-core';

import { AuthService } from './auth.service';

// TODO: simulates DID login, integrate passport-did-auth here
//  after https://energyweb.atlassian.net/browse/SWTCH-949 solved

@Injectable()
export class DidStrategy extends PassportStrategy(Strategy, 'did') {
    constructor(private readonly authService: AuthService) {
        super();
    }

    //TODO: to be removed after passport-did-auth integrated
    async validate(email: string, password: string): Promise<IUser> {
        const user = await this.authService.validateUser(email, password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
