import {
    ILoggedInUser,
    UserRegistrationData,
    UserUpdateData,
    IUser,
    UserPasswordUpdate,
    IEmailConfirmationToken,
    EmailConfirmationResponse
} from '@energyweb/origin-backend-core';
import {
    UserDecorator,
    ActiveUserGuard,
    NotDeletedUserGuard,
    NullOrUndefinedResultInterceptor
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
    ParseIntPipe,
    UnauthorizedException,
    HttpStatus
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';

import { UserService } from './user.service';
import { EmailConfirmationService } from '../email-confirmation/email-confirmation.service';
import { UserDTO } from './user.dto';
import { SuccessResponseDTO } from '../../utils/success-response.dto';

@ApiTags('user')
@UseInterceptors(ClassSerializerInterceptor, NullOrUndefinedResultInterceptor)
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly emailConfirmationService: EmailConfirmationService
    ) {}

    @Post('register')
    @ApiResponse({ status: HttpStatus.CREATED, type: UserDTO, description: 'Register a user' })
    public async register(@Body() userRegistrationData: UserRegistrationData): Promise<UserDTO> {
        return this.userService.create(userRegistrationData);
    }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    @ApiResponse({ status: HttpStatus.OK, type: UserDTO, description: 'Get my user profile' })
    me(@UserDecorator() user: ILoggedInUser): Promise<UserDTO> {
        return this.userService.findById(user.id);
    }

    @Put()
    @UseGuards(AuthGuard('jwt'), NotDeletedUserGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: UserDTO,
        description: `Update a user's profile (admin)`
    })
    public async update(
        @UserDecorator() user: ILoggedInUser,
        @Body() body: UserUpdateData
    ): Promise<UserDTO> {
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
    @ApiResponse({ status: HttpStatus.OK, type: UserDTO, description: `Get another user's data` })
    public async get(
        @Param('id', new ParseIntPipe()) id: number,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<UserDTO> {
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
    @ApiResponse({ status: HttpStatus.OK, type: UserDTO, description: `Update your own profile` })
    public async updateOwnProfile(
        @UserDecorator() { id }: ILoggedInUser,
        @Body() body: IUser
    ): Promise<UserDTO> {
        return this.userService.updateProfile(id, body);
    }

    @Put('password')
    @UseGuards(AuthGuard('jwt'), ActiveUserGuard)
    @ApiResponse({ status: HttpStatus.OK, type: UserDTO, description: `Update your own password` })
    public async updateOwnPassword(
        @UserDecorator() { email }: ILoggedInUser,
        @Body() body: UserPasswordUpdate
    ): Promise<UserDTO> {
        return this.userService.updatePassword(email, body);
    }

    @Put('chainAddress')
    @UseGuards(AuthGuard('jwt'), NotDeletedUserGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: UserDTO,
        description: `Update your own blockchain address`
    })
    public async updateOwnBlockchainAddress(
        @UserDecorator() { id }: ILoggedInUser,
        @Body() body: IUser
    ): Promise<UserDTO> {
        return this.userService.updateBlockChainAddress(id, body);
    }

    @Put('confirm-email/:token')
    @ApiResponse({
        status: HttpStatus.OK,
        type: String,
        description: `Confirm an email confirmation token`
    })
    @ApiParam({ name: 'token', type: String })
    public async confirmToken(
        @Param('token') token: IEmailConfirmationToken['token']
    ): Promise<EmailConfirmationResponse> {
        return this.emailConfirmationService.confirmEmail(token);
    }

    @Put('re-send-confirm-email')
    @UseGuards(AuthGuard('jwt'))
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: `Re-send a confirmation email`
    })
    public async reSendEmailConfirmation(
        @UserDecorator() { email }: ILoggedInUser
    ): Promise<SuccessResponseDTO> {
        return this.emailConfirmationService.sendConfirmationEmail(email);
    }
}
