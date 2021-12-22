import {
    ActiveUserGuard,
    BlockchainAccountGuard,
    BlockchainAccountDecorator,
    ExceptionInterceptor,
    Roles,
    RolesGuard
} from '@energyweb/origin-backend-utils';
import {
    Body,
    Controller,
    Post,
    UseGuards,
    Put,
    UseInterceptors,
    HttpStatus,
    UsePipes,
    ValidationPipe,
    HttpCode
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommandBus } from '@nestjs/cqrs';
import { Role } from '@energyweb/origin-backend-core';
import { BigNumber } from 'ethers';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import {
    BatchCertificateTransferDTO,
    BatchIssueCertificateDTO,
    BatchCertificateClaimDTO
} from './dto';
import {
    BatchClaimCertificatesCommand,
    BatchIssueCertificatesCommand,
    BatchTransferCertificatesCommand
} from './commands';
import { TxHashDTO } from './dto/tx-hash.dto';

@ApiTags('certificates')
@ApiBearerAuth('access-token')
@Controller('certificate-batch')
@UseInterceptors(ExceptionInterceptor)
@UsePipes(ValidationPipe)
export class CertificateBatchController {
    constructor(private readonly commandBus: CommandBus) {}

    @Post('issue')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard, BlockchainAccountGuard)
    @Roles(Role.Issuer)
    @ApiBody({ type: [BatchIssueCertificateDTO] })
    @ApiOkResponse({
        type: TxHashDTO,
        description: 'Triggers a Batch Issuance transaction and returns the transaction hash'
    })
    public async batchIssue(
        @Body() certificatesInfo: BatchIssueCertificateDTO[]
    ): Promise<TxHashDTO> {
        const tx = await this.commandBus.execute(
            new BatchIssueCertificatesCommand(certificatesInfo)
        );

        return { txHash: tx.hash };
    }

    @Put('transfer')
    @UseGuards(AuthGuard(), ActiveUserGuard, BlockchainAccountGuard)
    @ApiBody({ type: [BatchCertificateTransferDTO] })
    @ApiOkResponse({
        type: TxHashDTO,
        description: 'Triggers a Batch Transfer transaction and returns the transaction hash'
    })
    public async batchTransfer(
        @BlockchainAccountDecorator() blockchainAddress: string,
        @Body() transfers: [BatchCertificateTransferDTO]
    ): Promise<TxHashDTO> {
        const tx = await this.commandBus.execute(
            new BatchTransferCertificatesCommand(
                transfers.map((transfer) => ({
                    ...transfer,
                    amount: transfer.amount ? BigNumber.from(transfer.amount) : undefined,
                    from: transfer.from ?? blockchainAddress
                }))
            )
        );

        return { txHash: tx.hash };
    }

    @Put('claim')
    @UseGuards(AuthGuard(), ActiveUserGuard, BlockchainAccountGuard)
    @ApiBody({ type: [BatchCertificateClaimDTO] })
    @ApiOkResponse({
        type: TxHashDTO,
        description: 'Triggers a Batch Claim transaction and returns the transaction hash'
    })
    public async batchClaim(
        @BlockchainAccountDecorator() blockchainAddress: string,
        @Body() claims: BatchCertificateClaimDTO[]
    ): Promise<TxHashDTO> {
        const tx = await this.commandBus.execute(
            new BatchClaimCertificatesCommand(
                claims.map((claim) => ({
                    ...claim,
                    amount: claim.amount ? BigNumber.from(claim.amount) : undefined,
                    from: claim.from ?? blockchainAddress,
                    to: claim.to ?? blockchainAddress
                }))
            )
        );

        return { txHash: tx.hash };
    }
}
