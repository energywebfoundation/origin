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
import { BatchClaimCertificatesCommand } from './commands/batch-claim-certificates.command';
import { BatchClaimCertificatesDTO } from './commands/batch-claim-certificates.dto';
import { SuccessResponseDTO } from '../../utils/success-response.dto';
import { BatchIssueCertificateDTO } from './commands/batch-issue-certificates.dto';
import { BatchIssueCertificatesCommand } from './commands/batch-issue-certificates.command';
import { BatchTransferCertificatesDTO } from './commands/batch-transfer-certificates.dto';
import { BatchTransferCertificatesCommand } from './commands/batch-transfer-certificates.command';
import { CertificateIdsDTO } from './dto/certificate-ids.dto';

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
    @ApiBody({ type: BatchTransferCertificatesDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Returns whether the batch claim succeeded'
    })
    public async batchTransfer(
        @BlockchainAccountDecorator() blockchainAddress: string,
        @Body() { certificateAmounts, to }: BatchTransferCertificatesDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new BatchTransferCertificatesCommand(certificateAmounts, to, blockchainAddress)
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
        @Body() { certificateAmounts, claimData }: BatchClaimCertificatesDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new BatchClaimCertificatesCommand(certificateAmounts, claimData, blockchainAddress)
        );
    }
}
