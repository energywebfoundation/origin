import {
    ILoggedInUser,
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
import {
    ApiResponse,
    ApiTags,
    ApiParam,
    ApiBearerAuth,
    ApiBody,
    ApiUnprocessableEntityResponse
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { EmailConfirmationService } from '../email-confirmation/email-confirmation.service';
import { UserDTO } from './dto/user.dto';
import { SuccessResponseDTO } from '../../utils/success-response.dto';
import { RegisterUserDTO } from './dto/register-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UpdatePasswordDTO } from './dto/update-password.dto';
import { UpdateUserProfileDTO } from './dto/update-user-profile.dto';
import { BlockchainAccountDTO } from './dto/blockchain-account.dto';

@ApiTags('user')
@ApiBearerAuth('access-token')
@UseInterceptors(ClassSerializerInterceptor, NullOrUndefinedResultInterceptor)
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly emailConfirmationService: EmailConfirmationService
    ) {}

    @Post('register')
    @ApiBody({ type: RegisterUserDTO })
    @ApiResponse({ status: HttpStatus.CREATED, type: UserDTO, description: 'Register a user' })
    public async register(@Body() userRegistrationData: RegisterUserDTO): Promise<UserDTO> {
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
    @ApiBody({ type: UpdateUserDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: UserDTO,
        description: `Update a user's profile (admin)`
    })
    public async update(
        @UserDecorator() user: ILoggedInUser,
        @Body() body: UpdateUserDTO
    ): Promise<UserDTO> {
        try {
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
    @ApiBody({ type: UpdateUserProfileDTO })
    @ApiResponse({ status: HttpStatus.OK, type: UserDTO, description: `Update your own profile` })
    @ApiUnprocessableEntityResponse({ description: 'Input data validation failed' })
    public async updateOwnProfile(
        @UserDecorator() { id }: ILoggedInUser,
        @Body() dto: UpdateUserProfileDTO
    ): Promise<UserDTO> {
        return this.userService.updateProfile(id, dto);
    }

    @Put('password')
    @UseGuards(AuthGuard('jwt'), ActiveUserGuard)
    @ApiBody({ type: UpdatePasswordDTO })
    @ApiResponse({ status: HttpStatus.OK, type: UserDTO, description: `Update your own password` })
    public async updateOwnPassword(
        @UserDecorator() { email }: ILoggedInUser,
        @Body() body: UpdatePasswordDTO
    ): Promise<UserDTO> {
        return this.userService.updatePassword(email, body);
    }

    @Put('chainAddress')
    @UseGuards(AuthGuard('jwt'), NotDeletedUserGuard)
    @ApiBody({ type: BlockchainAccountDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: UserDTO,
        description: `Update your own blockchain address`
    })
    public async updateOwnBlockchainAddress(
        @UserDecorator() { id }: ILoggedInUser,
        @Body() { signedMessage }: BlockchainAccountDTO
    ): Promise<UserDTO> {
        return this.userService.updateBlockchainAddress(id, signedMessage);
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
