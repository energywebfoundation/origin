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
    Post,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RegistrationDTO } from './registration.dto';
import { Registration } from './registration.entity';
import { RegistrationService } from './registration.service';

@UseInterceptors(ClassSerializerInterceptor, NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
@Controller('irec/registration')
export class RegistrationController {
    constructor(private readonly registrationService: RegistrationService) {}

    @Get()
    @UseGuards(AuthGuard())
    public getRegistrations(@UserDecorator() loggedInUser: LoggedInUser): Promise<Registration[]> {
        const isAdmin = loggedInUser.hasRole(Role.Admin, Role.SupportAgent);

        return this.registrationService.find(
            isAdmin ? null : loggedInUser.organizationId.toString()
        );
    }

    @Post()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin)
    public async register(
        @UserDecorator() loggedInUser: LoggedInUser,
        @Body() registration: RegistrationDTO
    ): Promise<{ id: string }> {
        const id = await this.registrationService.register(loggedInUser, registration);

        return { id };
    }
}
