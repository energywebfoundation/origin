import { Response, Request } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Controller, Post, Req, Res, Body, InternalServerErrorException } from '@nestjs/common';

import { UserRegisterReturnData, UserRegisterData } from '@energyweb/origin-backend-core';
import { ConfigService } from '@nestjs/config';
import { User } from './user.entity';
import { STATUS_CODES } from '../../enums/StatusCodes';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly config: ConfigService
    ) {}

    @Post('/login')
    public login(@Req() req: Request, @Res() res: Response) {
        passport.authenticate('local', { session: false }, (authenticationError, user: User) => {
            if (authenticationError || !user) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ error: authenticationError });
            }

            const payload = {
                email: user.email,
                expires: Date.now() + this.config.get<number>('JWT_EXPIRY_TIME_MS')
            };

            req.login(payload, { session: false }, loginError => {
                if (loginError) {
                    res.status(STATUS_CODES.BAD_REQUEST).send({ error: loginError });
                }

                const token = jwt.sign(
                    JSON.stringify(payload),
                    this.config.get<string>('JWT_EXPIRY_TIME_MS')
                );

                res.status(STATUS_CODES.SUCCESS).send({ token });
            });
        })(req, res);
    }

    @Post('/register')
    public async register(@Body() body: UserRegisterData): Promise<UserRegisterReturnData> {
        const { email, password, title, firstName, lastName, telephone } = body;

        try {
            const user = await this.userService.create({
                email,
                password,
                title,
                firstName,
                lastName,
                telephone
            });

            return {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                telephone: user.telephone,
                title: user.title
            };
        } catch (error) {
            console.log('UserController::register() error', error);
            throw new InternalServerErrorException('Unknown error when registering user');
        }
    }
}
