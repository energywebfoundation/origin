import {
    ILoggedInUser,
    IUserWithRelationsIds,
    UserRegisterReturnData,
    UserRegistrationData,
    UserUpdateData
} from '@energyweb/origin-backend-core';
import { UserDecorator } from '@energyweb/origin-backend-utils';
import {
    BadRequestException,
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserService } from './user.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('register')
    public async register(
        @Body() userRegistrationData: UserRegistrationData
    ): Promise<UserRegisterReturnData> {
        const user = await this.userService.create(userRegistrationData);

        return user;
    }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    me(@UserDecorator() user: ILoggedInUser) {
        return this.userService.findById(user.id);
    }

    // TODO: should only update owned
    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    public async update(
        @Param('id') id: string,
        @Body() body: UserUpdateData
    ): Promise<IUserWithRelationsIds> {
        try {
            if (body.blockchainAccountSignedMessage) {
                await this.userService.attachSignedMessage(id, body.blockchainAccountSignedMessage);
            }

            if (typeof body.notifications !== 'undefined') {
                await this.userService.update(id, body);
            }

            return this.userService.findById(id);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get(':id')
    public async get(@Param('id') id: string) {
        return this.userService.findById(id);
    }
}
