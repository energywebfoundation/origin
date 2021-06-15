import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    Controller,
    Get,
    HttpStatus,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
    ActiveUserGuard,
    ExceptionInterceptor,
    UserDecorator
} from '@energyweb/origin-backend-utils';
import { CertificateController } from '@energyweb/issuer-api';

import { IssueWithStatus } from '@energyweb/issuer-irec-api-wrapper';
import { GetIrecCertificatesToImportCommand } from './command/get-irec-certificates-to-import.command';
import { ILoggedInUser } from '@energyweb/origin-backend-core';

@ApiTags('certificates')
@ApiBearerAuth('access-token')
@Controller('certificate')
@UseInterceptors(ExceptionInterceptor)
@UsePipes(ValidationPipe)
export class IrecCertificateController extends CertificateController {
    @Get('/irec-certificates-to-import')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: [IssueWithStatus],
        description: 'Returns not imported IREC certificates'
    })
    public async getIrecCertificateToImport(
        @UserDecorator() user: ILoggedInUser
    ): Promise<IssueWithStatus[]> {
        return await this.commandBus.execute(new GetIrecCertificatesToImportCommand(user));
    }
}
