import { Methods } from '@ew-did-registry/did';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import { LoginStrategy } from 'passport-did-auth';

@Injectable()
export class AuthStrategy extends PassportStrategy(LoginStrategy, 'login') {
    constructor(private configService: ConfigService) {
        super({
            claimField: 'claim',
            jwtSecret: configService.get<string>('JWT_SECRET'),
            jwtSignOptions: {
                algorithm: 'RS256'
            },
            rpcUrl: configService.get<string>('RPC_URL'),
            cacheServerUrl: configService.get<string>('CACHE_SERVER_URL'),
            privateKey: configService.get<string>('DEPLOY_KEY')
        });
    }

    getServerDid(): string {
        const address = this.configService.get<string>('SERVER_ADDRESS');
        const did = `did:${Methods.Erc1056}:${address}`;

        return did;
    }

    encodeToken(clientData: any) {
        const serverDid = this.getServerDid();
        const serverData = {
            did: serverDid
        };
        const payload = Object.assign({}, clientData, { node: serverData });
        const jwtSecret = this.configService.get<string>('JWT_SECRET') || '';

        return jwt.sign(payload, jwtSecret);
    }
}
