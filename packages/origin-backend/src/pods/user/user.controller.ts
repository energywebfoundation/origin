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

import { UserRegisterReturnData, UserRegisterData, IUser } from '@energyweb/origin-backend-core';

import { UserService } from './user.service';
import { UserDecorator } from './user.decorator';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('register')
    public async register(@Body() body: UserRegisterData): Promise<UserRegisterReturnData> {
        const { email, password, title, firstName, lastName, telephone } = body;

        try {
            const user = await this.userService.create({
                email,
                password,
                title,
                firstName,
                lastName,
                telephone,
                blockchainAccountAddress: '',
                blockchainAccountSignedMessage: ''
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
                organization: user.organization
            };
        } catch (error) {
            console.log('UserController::register() error', error);
            throw new InternalServerErrorException('Unknown error when registering user');
        }
    }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    me(@UserDecorator() user: IUser) {
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
        @Body('blockchainAccountSignedMessage') blockchainAccountSignedMessage: string
    ) {
        if (!blockchainAccountSignedMessage) {
            throw new BadRequestException('blockchainAccountSignedMessage has to be present');
        }

        try {
            await this.userService.attachSignedMessage(Number(id), blockchainAccountSignedMessage);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
