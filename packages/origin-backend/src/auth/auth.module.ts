import { Module, Global } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { ConfigService } from '@nestjs/config';
import { UserModule } from '../pods/user/user.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { DidStrategy } from './did.strategy';
import { JwtStrategy } from './jwt.strategy';
import { JwtBasicStrategy } from './jwt-basic.strategy';

@Global()
@Module({
    imports: [
        UserModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: configService.get<string>('JWT_EXPIRY_TIME') }
            }),
            inject: [ConfigService]
        })
    ],
    providers: [AuthService, LocalStrategy, DidStrategy, JwtStrategy, JwtBasicStrategy],
    exports: [AuthService, PassportModule, JwtModule]
})
export class AuthModule {}
