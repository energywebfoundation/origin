import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    HttpStatus,
    Post,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { ILoggedInUser, ISuccessResponse, ResponseSuccess } from '@energyweb/origin-backend-core';
import {
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor,
    UserDecorator
} from '@energyweb/origin-backend-utils';
import { ExportCertificateDTO } from './dto';
import { ExportCertificateCommand } from './command';

@ApiTags('irec-export')
@ApiBearerAuth('access-token')
@Controller('irec-export')
@UseInterceptors(ClassSerializerInterceptor, NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export class ExportController {
    constructor(public readonly commandBus: CommandBus) {}

    @Post('/certificate')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiBody({ type: ExportCertificateDTO })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: ExportCertificateDTO,
        description: 'Exports Certificate to IREC organization'
    })
    public async exportCertificate(
        @UserDecorator() user: ILoggedInUser,
        @Body() { certificateId, recipientTradeAccount }: ExportCertificateDTO
    ): Promise<ISuccessResponse> {
        await this.commandBus.execute(
            new ExportCertificateCommand(user, certificateId, recipientTradeAccount)
        );
        return ResponseSuccess('IREC certificate transferred');
    }
}
