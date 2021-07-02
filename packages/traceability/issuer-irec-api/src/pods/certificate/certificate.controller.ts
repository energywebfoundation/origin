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
import { ILoggedInUser } from '@energyweb/origin-backend-core';

import { GetIrecCertificatesToImportCommand } from './command';
import { IrecAccountItemDto } from './dto/irec-account-item.dto';

@ApiTags('irec-certificates')
@ApiBearerAuth('access-token')
@Controller('/certificate')
@UseInterceptors(ExceptionInterceptor)
@UsePipes(ValidationPipe)
export class IrecCertificateController extends CertificateController {
    @Get('/irec-certificates-to-import')
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
}
