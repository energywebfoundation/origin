import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UserService } from '../pods/user/user.service';
import { IJWTPayload } from './auth.service';

@Injectable()
export class JwtBasicStrategy extends PassportStrategy(Strategy, 'jwt-basic') {
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

    async validate(payload: IJWTPayload): Promise<IJWTPayload> {
        if (!payload.did) {
            return null;
        }
        return payload;
    }
}
