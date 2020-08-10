import {
    ILoggedInUser,
    UserRegisterReturnData,
    UserRegistrationData,
    UserUpdateData,
    IUser,
    UserPasswordUpdate,
    IEmailConfirmationToken,
    ISuccessResponse,
    EmailConfirmationResponse
} from '@energyweb/origin-backend-core';
import {
    UserDecorator,
    ActiveUserGuard,
    NotDeletedUserGuard
} from '@energyweb/origin-backend-utils';
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
import { EmailConfirmationService } from '../email-confirmation/email-confirmation.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('user')
export class UserController {
    private readonly logger = new Logger(UserController.name);

    constructor(
        private readonly userService: UserService,
        private readonly emailConfirmationService: EmailConfirmationService
    ) {}

    @Post('register')
    public async register(
        @Body() userRegistrationData: UserRegistrationData
    ): Promise<UserRegisterReturnData> {
        return this.userService.create(userRegistrationData);
    }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    me(@UserDecorator() user: ILoggedInUser) {
        return this.userService.findById(user.id);
    }

    @Put()
    @UseGuards(AuthGuard('jwt'), NotDeletedUserGuard)
    public async update(
        @UserDecorator() user: ILoggedInUser,
        @Body() body: UserUpdateData
    ): Promise<IUser> {
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
    @UseGuards(AuthGuard('jwt'), NotDeletedUserGuard)
    public async updateOwnBlockchainAddress(
        @UserDecorator() { id }: ILoggedInUser,
        @Body() body: IUser
    ) {
        return this.userService.updateBlockChainAddress(id, body);
    }

    @Put('confirm-email/:token')
    public async confirmToken(
        @Param('token') token: IEmailConfirmationToken['token']
    ): Promise<EmailConfirmationResponse> {
        return this.emailConfirmationService.confirmEmail(token);
    }

    @Put('re-send-confirm-email')
    @UseGuards(AuthGuard('jwt'))
    public async reSendEmailConfirmation(
        @UserDecorator() { email }: ILoggedInUser
    ): Promise<ISuccessResponse> {
        return this.emailConfirmationService.sendConfirmationEmail(email);
    }
}
