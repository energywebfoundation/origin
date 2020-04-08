import {
    Controller,
    Post,
    Body,
    InternalServerErrorException,
    UseGuards,
    Get,
    Param,
    BadRequestException,
    Put
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import {
    UserRegisterReturnData,
    UserRegisterData,
    IUserWithRelationsIds,
    UserUpdateData
} from '@energyweb/origin-backend-core';

import { UserService } from './user.service';
import { UserDecorator } from './user.decorator';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('register')
    public async register(@Body() body: UserRegisterData): Promise<UserRegisterReturnData> {
        const {
            email,
            password,
            title,
            firstName,
            lastName,
            telephone,
            notifications,
            autoPublish,
            rights
        } = body;

        try {
            const user = await this.userService.create({
                email,
                password,
                title,
                firstName,
                lastName,
                telephone,
                notifications,
                autoPublish,
                rights
            });

            return {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                telephone: user.telephone,
                title: user.title,
                blockchainAccountAddress: user.blockchainAccountAddress,
                blockchainAccountSignedMessage: user.blockchainAccountSignedMessage,
                organization: user.organization,
                autoPublish: user.autoPublish,
                notifications: user.notifications,
                rights: user.rights
            };
        } catch (error) {
            console.log('UserController::register() error', error);
            throw new InternalServerErrorException('Unknown error when registering user');
        }
    }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    me(@UserDecorator() user: IUserWithRelationsIds) {
        return this.userService.findById(user.id);
    }

    @Get('for-blockchain-account/:address')
    getUserForBlockchainAccount(@Param('address') address: string) {
        if (address) {
            return this.userService.findByBlockchainAccount(address?.toLowerCase());
        }

        return null;
    }

    @Put(':id')
    public async update(
        @Param('id') id: string,
        @Body() body: UserUpdateData
    ): Promise<IUserWithRelationsIds> {
        try {
            if (body.blockchainAccountSignedMessage) {
                await this.userService.attachSignedMessage(id, body.blockchainAccountSignedMessage);
            }

            if (
                typeof body.notifications !== 'undefined' ||
                typeof body.autoPublish !== 'undefined'
            ) {
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
