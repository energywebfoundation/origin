import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Post,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';

import {
    ActiveOrganizationGuard,
    ActiveUserGuard,
    ExceptionInterceptor,
    Roles,
    RolesGuard,
    SuccessResponseDTO,
    UserDecorator
} from '@energyweb/origin-backend-utils';
import { ILoggedInUser, Role } from '@energyweb/origin-backend-core';

import { GetIrecCertificatesToImportCommand, ImportIrecCertificateCommand } from './command';
import { ImportIrecCertificateDTO, IrecAccountItemDto } from './dto';
import { CommandBus } from '@nestjs/cqrs';

@ApiTags('irec-import')
@ApiBearerAuth('access-token')
@Controller('/irec/import')
@UseInterceptors(ExceptionInterceptor)
@UsePipes(ValidationPipe)
export class ImportController {
    constructor(public readonly commandBus: CommandBus) {}

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: [IrecAccountItemDto],
        description: 'Returns not imported IREC certificates'
    })
    public async getIrecCertificateToImport(
        @UserDecorator() user: ILoggedInUser
    ): Promise<IrecAccountItemDto[]> {
        return await this.commandBus.execute(new GetIrecCertificatesToImportCommand(user));
    }

    @Post()
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard, ActiveOrganizationGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    @ApiBody({ type: ImportIrecCertificateDTO })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: SuccessResponseDTO,
        description: 'Imports a certificate from IREC'
    })
    async importIrecCertificate(
        @Body() certificateToImport: ImportIrecCertificateDTO,
        @UserDecorator() loggedInUser: ILoggedInUser
    ): Promise<SuccessResponseDTO> {
        return await this.commandBus.execute(
            new ImportIrecCertificateCommand(loggedInUser, certificateToImport)
        );
    }
}
