import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Put,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';

import {
    ActiveOrganizationGuard,
    ActiveUserGuard,
    BlockchainAccountGuard,
    ExceptionInterceptor,
    Roles,
    RolesGuard,
    SuccessResponseDTO,
    UserDecorator
} from '@energyweb/origin-backend-utils';
import { CertificateController, ClaimCertificateDTO } from '@energyweb/issuer-api';
import { ILoggedInUser, Role } from '@energyweb/origin-backend-core';

import {
    ClaimIRECCertificateCommand,
    GetIrecCertificatesToImportCommand,
    ImportIrecCertificateCommand
} from './command';
import { ImportIrecCertificateDTO, IrecAccountItemDto } from './dto';

@ApiTags('irec-certificates')
@ApiBearerAuth('access-token')
@Controller('/irec/certificate')
@UseInterceptors(ExceptionInterceptor)
@UsePipes(ValidationPipe)
export class IrecCertificateController extends CertificateController {
    @Get('/importable')
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

    @Post('/import')
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

    @Put('/:id/claim')
    @UseGuards(AuthGuard(), ActiveUserGuard, BlockchainAccountGuard)
    @ApiBody({ type: ClaimCertificateDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Returns whether the claim succeeded'
    })
    public async claimIREC(
        @UserDecorator() user: ILoggedInUser,
        @Param('id', new ParseIntPipe()) certificateId: number,
        @Body() dto: ClaimCertificateDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new ClaimIRECCertificateCommand(user, certificateId, dto.claimData)
        );
    }
}
