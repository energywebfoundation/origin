import { LoginStrategy } from 'passport-did-auth';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DidStrategy extends PassportStrategy(LoginStrategy, 'did') {
    constructor() {
        super({
            jwtSecret: process.env.JWT_SECRET,
            jwtSignOptions: {
                expiresIn: process.env.JWT_EXPIRY_TIME
            },
            rpcUrl: process.env.RPC_URL || 'https://volta-rpc.energyweb.org/',
            cacheServerUrl:
                process.env.CACHE_SERVER_URL || 'https://identitycache-dev.energyweb.org/',
            acceptedRoles: [],
            privateKey:
                process.env.DEPLOY_KEY ||
                '9945c05be0b1b7b35b7cec937e78c6552ecedca764b53a772547d94a687db929'
        });
    }
}
