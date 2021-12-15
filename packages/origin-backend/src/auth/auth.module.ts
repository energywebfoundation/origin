import { Module, Global } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';

import { UserModule } from '../pods/user/user.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { ResetPasswordService } from './reset-password.service';

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
        }),
        CqrsModule
    ],
    providers: [AuthService, ResetPasswordService, LocalStrategy, JwtStrategy],
    exports: [AuthService, ResetPasswordService, PassportModule, JwtModule]
})
export class AuthModule {}
