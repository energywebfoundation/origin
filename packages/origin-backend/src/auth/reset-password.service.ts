import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UserService } from '../pods/user';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordRequestedEvent } from './events';
import { EventBus } from '@nestjs/cqrs';

interface IJwtPayload {
    email: string;
    hash: string; // this is used to verify whether password was not changed already - this way token can be used only once
}

@Injectable()
export class ResetPasswordService {
    private readonly logger = new Logger(ResetPasswordService.name);

    constructor(
        private userService: UserService,
        private configService: ConfigService,
        private jwtService: JwtService,
        private eventBus: EventBus
    ) {}

    public async requestPasswordReset(email: string): Promise<string | null> {
        this.logger.log(`Password reset requested for email: ${email}`);

        const user = await this.userService.findByEmail(email);

        if (!user) {
            return null;
        }

        const jwtPayload: IJwtPayload = { email, hash: user.password };
        const jwtToken = Buffer.from(
            await this.jwtService.signAsync(jwtPayload, {
                expiresIn: '12h'
            })
        ).toString('base64');

        this.eventBus.publish(new ResetPasswordRequestedEvent(email, jwtToken));

        return jwtToken;
    }

    public async resetPassword(encodedJwtToken: string, newPassword: string): Promise<void> {
        const jwtToken = Buffer.from(encodedJwtToken, 'base64').toString('ascii');

        try {
            const { email, hash }: IJwtPayload = await this.jwtService.verifyAsync(jwtToken);

            const user = await this.userService.findByEmail(email);

            if (!user) {
                throw new BadRequestException('Reset token is valid, but user was not found');
            }

            if (user.password !== hash) {
                throw new BadRequestException(
                    'Reset token is valid, but password was already changed using this token'
                );
            }

            await this.userService.setPassword(email, newPassword);
        } catch (e) {
            if (e instanceof BadRequestException) {
                throw e;
            }

            this.logger.error(e.message);

            throw new BadRequestException('Invalid JWT token');
        }
    }
}
