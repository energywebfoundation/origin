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
import { ExportAssetDTO } from './dto';
import { ExportAssetCommand } from './command';

@ApiTags('irec-export')
@ApiBearerAuth('access-token')
@Controller('irec/export')
@UseInterceptors(ClassSerializerInterceptor, NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export class ExportController {
    constructor(public readonly commandBus: CommandBus) {}

    @Post()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiBody({ type: ExportAssetDTO })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: ExportAssetDTO,
        description: 'Exports Exchange Certificate to IREC organization'
    })
    public async exportCertificate(
        @UserDecorator() user: ILoggedInUser,
        @Body() { assetId, recipientTradeAccount, amount, fromTradeAccount }: ExportAssetDTO
    ): Promise<ISuccessResponse> {
        await this.commandBus.execute(
            new ExportAssetCommand(user, assetId, recipientTradeAccount, amount, fromTradeAccount)
        );
        return ResponseSuccess('IREC certificate exported');
    }
}
