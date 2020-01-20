import { Controller, Post, Body, InternalServerErrorException } from '@nestjs/common';

import { UserRegisterReturnData, UserRegisterData } from '@energyweb/origin-backend-core';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

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
