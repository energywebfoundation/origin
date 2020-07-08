import {
    ILoggedInUser,
    IUserWithRelationsIds,
    UserRegisterReturnData,
    UserRegistrationData,
    UserUpdateData,
    IUser,
    UserPasswordUpdate
} from '@energyweb/origin-backend-core';
import { UserDecorator, ActiveUserGuard } from '@energyweb/origin-backend-utils';
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
    UseInterceptors,
    Logger,
    ParseIntPipe,
    UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserService } from './user.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('user')
export class UserController {
    private readonly logger = new Logger(UserController.name);

    constructor(private readonly userService: UserService) {}

    @Post('register')
    public async register(
        @Body() userRegistrationData: UserRegistrationData
    ): Promise<UserRegisterReturnData> {
        const user = await this.userService.create(userRegistrationData);

        return user;
    }

    @Get('me')
    @UseGuards(AuthGuard('jwt') /* ActiveUserGuard */)
    me(@UserDecorator() user: ILoggedInUser) {
        return this.userService.findById(user.id);
    }

    @Put()
    @UseGuards(AuthGuard('jwt'), ActiveUserGuard)
    public async update(
        @UserDecorator() user: ILoggedInUser,
        @Body() body: UserUpdateData
    ): Promise<IUserWithRelationsIds> {
        try {
            if (body.blockchainAccountSignedMessage) {
                await this.userService.attachSignedMessage(
                    user.id,
                    body.blockchainAccountSignedMessage
                );
            }

            if (typeof body.notifications !== 'undefined') {
                await this.userService.setNotifications(user.id, body.notifications);
            }

            return this.userService.findById(user.id);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'), ActiveUserGuard)
    public async get(
        @Param('id', new ParseIntPipe()) id: number,
        @UserDecorator() loggedUser: ILoggedInUser
    ) {
        const canViewUserData = await this.userService.canViewUserData(id, loggedUser);

        if (!canViewUserData) {
            throw new UnauthorizedException({
                success: false,
                message: `Unable to fetch user data. Unauthorized.`
            });
        }

        return this.userService.findById(id);
    }

    @Put('profile')
    @UseGuards(AuthGuard('jwt'), ActiveUserGuard)
    public async updateOwnProfile(@UserDecorator() { id }: ILoggedInUser, @Body() body: IUser) {
        return this.userService.updateProfile(id, body);
    }

    @Put('password')
    @UseGuards(AuthGuard('jwt'), ActiveUserGuard)
    public async updateOwnPassword(
        @UserDecorator() { email }: ILoggedInUser,
        @Body() body: UserPasswordUpdate
    ) {
        return this.userService.updatePassword(email, body);
    }

    @Put('chainAddress')
    @UseGuards(AuthGuard('jwt'), ActiveUserGuard)
    public async updateOwnBlockchainAddress(
        @UserDecorator() { id }: ILoggedInUser,
        @Body() body: IUser
    ) {
        return this.userService.updateBlockChainAddress(id, body);
    }
}
