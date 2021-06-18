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
    ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommandBus } from '@nestjs/cqrs';
import { Role } from '@energyweb/origin-backend-core';

import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BigNumber } from 'ethers';
import { BatchClaimCertificatesCommand } from './commands/batch-claim-certificates.command';
import { BatchClaimCertificatesDTO } from './commands/batch-claim-certificates.dto';
import { SuccessResponseDTO } from '../../utils/success-response.dto';
import { BatchIssueCertificatesDTO } from './commands/batch-issue-certificates.dto';
import { BatchIssueCertificatesCommand } from './commands/batch-issue-certificates.command';
import { BatchTransferCertificatesDTO } from './commands/batch-transfer-certificates.dto';
import { BatchTransferCertificatesCommand } from './commands/batch-transfer-certificates.command';

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
    @ApiBody({ type: BatchIssueCertificatesDTO })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: SuccessResponseDTO,
        description: 'Returns whether the batch issuance succeeded'
    })
    public async batchIssue(
        @Body() { certificatesInfo }: BatchIssueCertificatesDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(new BatchIssueCertificatesCommand(certificatesInfo));
    }

    @Put('transfer')
    @UseGuards(AuthGuard(), ActiveUserGuard, BlockchainAccountGuard)
    @ApiBody({ type: BatchTransferCertificatesDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Returns whether the batch claim succeeded'
    })
    public async batchTransfer(
        @BlockchainAccountDecorator() blockchainAddress: string,
        @Body() { certificateIds, values, to }: BatchTransferCertificatesDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new BatchTransferCertificatesCommand(
                certificateIds,
                to,
                blockchainAddress,
                values.map((value) => BigNumber.from(value))
            )
        );
    }

    @Put('claim')
    @UseGuards(AuthGuard(), ActiveUserGuard, BlockchainAccountGuard)
    @ApiBody({ type: BatchClaimCertificatesDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Returns whether the batch claim succeeded'
    })
    public async batchClaim(
        @BlockchainAccountDecorator() blockchainAddress: string,
        @Body() dto: BatchClaimCertificatesDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new BatchClaimCertificatesCommand(
                dto.certificateIds,
                dto.claimData,
                blockchainAddress,
                dto.values?.map((value) => BigNumber.from(value))
            )
        );
    }
}
