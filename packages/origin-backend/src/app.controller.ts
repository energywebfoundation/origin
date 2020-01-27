import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';
import { IUser, UserLoginReturnData } from '@energyweb/origin-backend-core';

import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(AuthGuard('local'))
    @Post('auth/login')
    async login(@Request() req: ExpressRequest): Promise<UserLoginReturnData> {
        return this.authService.login(req.user as Omit<IUser, 'password'>);
    }
}
