import { LoggedInUser, Role } from '@energyweb/origin-backend-core';
import {
    NullOrUndefinedResultInterceptor,
    Roles,
    RolesGuard,
    UserDecorator
} from '@energyweb/origin-backend-utils';
import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    HttpStatus,
    Post,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { NewRegistrationDTO } from './new-registration.dto';
import { RegisterResponseDTO } from './registration-response.dto';
import { RegistrationDTO } from './registration.dto';
import { RegistrationService } from './registration.service';

@ApiTags('irec_registration')
@ApiBearerAuth('access-token')
@UseInterceptors(ClassSerializerInterceptor, NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
@Controller('irec/registration')
export class RegistrationController {
    constructor(private readonly registrationService: RegistrationService) {}

    @Get()
    @UseGuards(AuthGuard())
    @ApiResponse({
        status: HttpStatus.OK,
        type: [RegistrationDTO],
        description: 'Get all registrations'
    })
    public getRegistrations(
        @UserDecorator() loggedInUser: LoggedInUser
    ): Promise<RegistrationDTO[]> {
        const isAdmin = loggedInUser.hasRole(Role.Admin, Role.SupportAgent);

        return this.registrationService.find(
            isAdmin ? null : loggedInUser.organizationId.toString()
        );
    }

    @Post()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin)
    @ApiBody({ type: NewRegistrationDTO })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: RegisterResponseDTO,
        description: 'Register an I-REC organization'
    })
    public async register(
        @UserDecorator() loggedInUser: LoggedInUser,
        @Body() registration: NewRegistrationDTO
    ): Promise<RegisterResponseDTO> {
        const id = await this.registrationService.register(loggedInUser, registration);

        return { id };
    }
}
