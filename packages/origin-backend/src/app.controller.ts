import { Request as ExpressRequest } from 'express';
import {
    Controller,
    Request,
    Post,
    UseGuards,
    HttpCode,
    HttpStatus,
    Patch,
    Body
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IUser } from '@energyweb/origin-backend-core';

import {
    AuthService,
    LoginReturnDataDTO,
    LoginDataDTO,
    PasswordResetDTO,
    RequestPasswordResetDTO,
    ResetPasswordService
} from './auth';

@ApiTags('auth')
@ApiBearerAuth('access-token')
@Controller()
export class AppController {
    constructor(
        private readonly authService: AuthService,
        private readonly resetPasswordService: ResetPasswordService
    ) {}

    @UseGuards(AuthGuard('local'))
    @Post('auth/login')
    @HttpCode(HttpStatus.OK)
    @ApiBody({ type: LoginDataDTO })
    @ApiResponse({ status: HttpStatus.OK, type: LoginReturnDataDTO, description: 'Log in' })
    async login(@Request() req: ExpressRequest): Promise<LoginReturnDataDTO> {
        return this.authService.login(req.user as Omit<IUser, 'password'>);
    }

    @Post('password-reset')
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiBody({ type: RequestPasswordResetDTO })
    @ApiResponse({ status: HttpStatus.ACCEPTED })
    async requestPasswordReset(@Body() body: RequestPasswordResetDTO): Promise<void> {
        await this.resetPasswordService.requestPasswordReset(body.email);
    }

    @Patch('password-reset')
    @HttpCode(HttpStatus.CREATED)
    @ApiBody({ type: PasswordResetDTO })
    @ApiResponse({ status: HttpStatus.CREATED })
    async passwordReset(@Body() body: PasswordResetDTO): Promise<void> {
        await this.resetPasswordService.resetPassword(body.token, body.password);
    }
}
