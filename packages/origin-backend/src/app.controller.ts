import { Controller, Request, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';
import { IUser } from '@energyweb/origin-backend-core';

import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth/auth.service';
import { LoginReturnDataDTO } from './auth/login-return-data.dto';
import { LoginDataDTO } from './auth/models/login-data.dto';

@ApiTags('auth')
@ApiBearerAuth('access-token')
@Controller()
export class AppController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(AuthGuard('local'))
    @Post('auth/login')
    @HttpCode(HttpStatus.OK)
    @ApiBody({ type: LoginDataDTO })
    @ApiResponse({ status: HttpStatus.OK, type: LoginReturnDataDTO, description: 'Log in' })
    async login(@Request() req: ExpressRequest): Promise<LoginReturnDataDTO> {
        return this.authService.login(req.user as Omit<IUser, 'password'>);
    }
}
