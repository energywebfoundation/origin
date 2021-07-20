import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiForbiddenResponse,
    ApiResponse,
    ApiTags
} from '@nestjs/swagger';
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
    UserDecorator
} from '@energyweb/origin-backend-utils';
import { CertificateController } from '@energyweb/issuer-api';
import { ILoggedInUser, Role } from '@energyweb/origin-backend-core';
import { DeviceDTO } from '@energyweb/origin-device-registry-irec-local-api';

import { GetIrecCertificatesToImportCommand, ImportIrecCertificateCommand } from './command';
import { IrecAccountItemDto, ImportIrecCertificateDTO } from './dto';

@ApiTags('irec-certificates')
@ApiBearerAuth('access-token')
@Controller('/irec/certificate')
@UseInterceptors(ExceptionInterceptor)
@UsePipes(ValidationPipe)
export class IrecCertificateController extends CertificateController {
    @Get('/certificates-to-import')
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

    @Post('/import-irec-certificate')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard, ActiveOrganizationGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    @ApiBody({ type: ImportIrecCertificateDTO })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: DeviceDTO,
        description: 'Imports a certificate from IREC'
    })
    async importIrecDevice(
        @Body() certificateToImport: ImportIrecCertificateDTO,
        @UserDecorator() loggedInUser: ILoggedInUser
    ): Promise<DeviceDTO> {
        return await this.commandBus.execute(
            new ImportIrecCertificateCommand(loggedInUser, certificateToImport)
        );
    }
}
