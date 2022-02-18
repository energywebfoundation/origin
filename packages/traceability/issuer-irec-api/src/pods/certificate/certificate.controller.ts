import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
    Body,
    Controller,
    HttpStatus,
    Param,
    ParseIntPipe,
    Put,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';

import {
    ActiveUserGuard,
    BlockchainAccountGuard,
    ExceptionInterceptor,
    UserDecorator
} from '@energyweb/origin-backend-utils';
import { CertificateController, TxHashDTO } from '@energyweb/issuer-api';
import { ClaimIrecCertificateDTO } from './dto/claim-irec-certificate.dto';
import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { ClaimIRECCertificateCommand } from './command';

@ApiTags('irec-certificates')
@ApiBearerAuth('access-token')
@Controller('/irec/certificate')
@UseInterceptors(ExceptionInterceptor)
@UsePipes(ValidationPipe)
export class IrecCertificateController extends CertificateController {
    @Put('/:id/claim')
    @UseGuards(AuthGuard(), ActiveUserGuard, BlockchainAccountGuard)
    @ApiBody({ type: ClaimIrecCertificateDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: TxHashDTO,
        description: 'Returns whether the claim succeeded'
    })
    public async claimIREC(
        @UserDecorator() user: ILoggedInUser,
        @Param('id', new ParseIntPipe()) certificateId: number,
        @Body() dto: ClaimIrecCertificateDTO
    ): Promise<TxHashDTO> {
        const tx = await this.commandBus.execute(
            new ClaimIRECCertificateCommand(user, certificateId, dto.claimData)
        );

        return { txHash: tx.hash };
    }
}
