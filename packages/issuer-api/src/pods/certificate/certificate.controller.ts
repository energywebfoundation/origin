import { ActiveUserGuard, Roles, RolesGuard, UserDecorator } from '@energyweb/origin-backend-utils';
import {
    Body,
    Controller,
    Get,
    Logger,
    Post,
    UseGuards,
    Param,
    ParseIntPipe,
    Put
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ILoggedInUser, Role } from '@energyweb/origin-backend-core';

import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IssueCertificateCommand } from './commands/issue-certificate.command';
import { IssueCertificateDTO } from './commands/issue-certificate.dto';
import { GetAllCertificatesQuery } from './queries/get-all-certificates.query';
import { GetCertificateQuery } from './queries/get-certificate.query';
import { TransferCertificateCommand } from './commands/transfer-certificate.command';
import { TransferCertificateDTO } from './commands/transfer-certificate.dto';
import { ClaimCertificateDTO } from './commands/claim-certificate.dto';
import { ClaimCertificateCommand } from './commands/claim-certificate.command';
import { GetCertificateByTokenIdQuery } from './queries/get-certificate-by-token.query';
import { BulkClaimCertificatesCommand } from './commands/bulk-claim-certificates.command';
import { BulkClaimCertificatesDTO } from './commands/bulk-claim-certificates.dto';
import { CertificateEvent } from '../../types';
import { GetAllCertificateEventsQuery } from './queries/get-all-certificate-events.query';
import { CertificateDTO } from './certificate.dto';
import { SuccessResponseDTO } from '../../utils/success-response.dto';

@ApiTags('certificates')
@Controller('certificate')
export class CertificateController {
    private readonly logger = new Logger(CertificateController.name);

    constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

    @Get('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({ status: 200, type: CertificateDTO, description: 'Returns a Certificate' })
    public async get(
        @Param('id', new ParseIntPipe()) id: number,
        @UserDecorator() { blockchainAccountAddress }: ILoggedInUser
    ): Promise<CertificateDTO> {
        return this.queryBus.execute(new GetCertificateQuery(id, blockchainAccountAddress));
    }

    @Get('/token-id/:tokenId')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: 200,
        type: CertificateDTO,
        description: 'Returns a Certificate by token ID'
    })
    public async getByTokenId(
        @Param('tokenId', new ParseIntPipe()) tokenId: number,
        @UserDecorator() { blockchainAccountAddress }: ILoggedInUser
    ): Promise<CertificateDTO> {
        return this.queryBus.execute(
            new GetCertificateByTokenIdQuery(tokenId, blockchainAccountAddress)
        );
    }

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: 200,
        type: [CertificateDTO],
        description: 'Returns all Certificates'
    })
    public async getAll(
        @UserDecorator() { blockchainAccountAddress }: ILoggedInUser
    ): Promise<CertificateDTO[]> {
        return this.queryBus.execute(new GetAllCertificatesQuery(blockchainAccountAddress));
    }

    @Post()
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Issuer)
    @ApiResponse({
        status: 201,
        type: CertificateDTO,
        description: 'Returns the issued Certificate'
    })
    @ApiBody({ type: IssueCertificateDTO })
    public async issue(
        @UserDecorator() { blockchainAccountAddress }: ILoggedInUser,
        @Body() dto: IssueCertificateDTO
    ): Promise<CertificateDTO> {
        return this.commandBus.execute(
            new IssueCertificateCommand(
                dto.to,
                dto.energy,
                dto.fromTime,
                dto.toTime,
                dto.deviceId,
                blockchainAccountAddress,
                dto.isPrivate
            )
        );
    }

    @Put('/:id/transfer')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiBody({ type: TransferCertificateDTO })
    @ApiResponse({
        status: 200,
        type: SuccessResponseDTO,
        description: 'Returns whether the transfer succeeded'
    })
    public async transfer(
        @UserDecorator() { blockchainAccountAddress }: ILoggedInUser,
        @Param('id', new ParseIntPipe()) certificateId: number,
        @Body() dto: TransferCertificateDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new TransferCertificateCommand(
                certificateId,
                blockchainAccountAddress,
                dto.to,
                dto.amount,
                dto.delegated
            )
        );
    }

    @Put('/:id/claim')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiBody({ type: ClaimCertificateDTO })
    @ApiResponse({
        status: 200,
        type: SuccessResponseDTO,
        description: 'Returns whether the claim succeeded'
    })
    public async claim(
        @UserDecorator() { blockchainAccountAddress }: ILoggedInUser,
        @Param('id', new ParseIntPipe()) certificateId: number,
        @Body() dto: ClaimCertificateDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new ClaimCertificateCommand(
                certificateId,
                dto.claimData,
                blockchainAccountAddress,
                dto.amount
            )
        );
    }

    @Put('/bulk-claim')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiBody({ type: BulkClaimCertificatesDTO })
    @ApiResponse({
        status: 200,
        type: SuccessResponseDTO,
        description: 'Returns whether the bulk claim succeeded'
    })
    public async bulkClaim(
        @UserDecorator() { blockchainAccountAddress }: ILoggedInUser,
        @Body() dto: BulkClaimCertificatesDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new BulkClaimCertificatesCommand(
                dto.certificateIds,
                dto.claimData,
                blockchainAccountAddress
            )
        );
    }

    @Get('/:id/events')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: 200,
        type: [CertificateEvent],
        description: 'Returns all the events for a Certificate'
    })
    public async getAllEvents(
        @Param('id', new ParseIntPipe()) id: number
    ): Promise<CertificateEvent[]> {
        return this.queryBus.execute(new GetAllCertificateEventsQuery(id));
    }
}
