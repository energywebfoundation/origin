import {
    ActiveUserGuard,
    BlockchainAccountGuard,
    BlockchainAccountDecorator,
    ExceptionInterceptor,
    Roles,
    RolesGuard,
    SuccessResponseDTO
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
    ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommandBus } from '@nestjs/cqrs';
import { Role } from '@energyweb/origin-backend-core';
import { BigNumber } from 'ethers';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

import { BatchClaimCertificatesCommand } from './commands/batch-claim-certificates.command';
import { BatchIssueCertificateDTO } from './commands/batch-issue-certificates.dto';
import { BatchIssueCertificatesCommand } from './commands/batch-issue-certificates.command';
import { BatchTransferCertificatesCommand } from './commands/batch-transfer-certificates.command';
import { CertificateIdsDTO } from './dto/certificate-ids.dto';
import { BatchCertificateTransferDTO } from './dto/batch-certificate-transfer.dto';
import { BatchCertificateClaimDTO } from './dto/batch-certificate-claim.dto';

@ApiTags('certificates')
@ApiBearerAuth('access-token')
@Controller('certificate-batch')
@UseInterceptors(ExceptionInterceptor)
@UsePipes(ValidationPipe)
export class CertificateBatchController {
    constructor(private readonly commandBus: CommandBus) {}

    @Post('issue')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard, BlockchainAccountGuard)
    @Roles(Role.Issuer)
    @ApiBody({ type: [BatchIssueCertificateDTO] })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: CertificateIdsDTO,
        description: 'Returns the IDs of created certificates'
    })
    public async batchIssue(
        @Body() certificatesInfo: BatchIssueCertificateDTO[]
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(new BatchIssueCertificatesCommand(certificatesInfo));
    }

    @Put('transfer')
    @UseGuards(AuthGuard(), ActiveUserGuard, BlockchainAccountGuard)
    @ApiBody({ type: [BatchCertificateTransferDTO] })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Returns whether the batch claim succeeded'
    })
    public async batchTransfer(
        @BlockchainAccountDecorator() blockchainAddress: string,
        @Body() transfers: [BatchCertificateTransferDTO]
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new BatchTransferCertificatesCommand(
                transfers.map((transfer) => ({
                    ...transfer,
                    amount: transfer.amount ? BigNumber.from(transfer.amount) : undefined,
                    from: transfer.from ?? blockchainAddress
                }))
            )
        );
    }

    @Put('claim')
    @UseGuards(AuthGuard(), ActiveUserGuard, BlockchainAccountGuard)
    @ApiBody({ type: [BatchCertificateClaimDTO] })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Returns whether the batch claim succeeded'
    })
    public async batchClaim(
        @BlockchainAccountDecorator() blockchainAddress: string,
        @Body() claims: BatchCertificateClaimDTO[]
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new BatchClaimCertificatesCommand(
                claims.map((claim) => ({
                    ...claim,
                    amount: claim.amount ? BigNumber.from(claim.amount) : undefined,
                    from: claim.from ?? blockchainAddress,
                    to: claim.to ?? blockchainAddress
                }))
            )
        );
    }
}
