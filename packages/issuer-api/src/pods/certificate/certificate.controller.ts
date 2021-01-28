import {
    ActiveUserGuard,
    BlockchainAccountGuard,
    BlockchainAccountsDecorator,
    ExceptionInterceptor,
    Roles,
    RolesGuard
} from '@energyweb/origin-backend-utils';
import {
    Body,
    Controller,
    Get,
    Post,
    UseGuards,
    Param,
    ParseIntPipe,
    Put,
    UseInterceptors,
    HttpStatus,
    Query
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { IBlockchainAccount, Role } from '@energyweb/origin-backend-core';

import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import moment from 'moment';
import { IssueCertificateCommand } from './commands/issue-certificate.command';
import { IssueCertificateDTO } from './commands/issue-certificate.dto';
import { GetAllCertificatesQuery } from './queries/get-all-certificates.query';
import { GetCertificateQuery } from './queries/get-certificate.query';
import { TransferCertificateCommand } from './commands/transfer-certificate.command';
import { TransferCertificateDTO } from './commands/transfer-certificate.dto';
import { ClaimCertificateDTO } from './commands/claim-certificate.dto';
import { ClaimCertificateCommand } from './commands/claim-certificate.command';
import { GetCertificateByTokenIdQuery } from './queries/get-certificate-by-token.query';
import { GetAggregateCertifiedEnergyByDeviceIdQuery } from './queries/get-aggregate-certified-energy-by-device.query';
import { BulkClaimCertificatesCommand } from './commands/bulk-claim-certificates.command';
import { BulkClaimCertificatesDTO } from './commands/bulk-claim-certificates.dto';
import { CertificateEvent } from '../../types';
import { GetAllCertificateEventsQuery } from './queries/get-all-certificate-events.query';
import { CertificateDTO } from './certificate.dto';
import { SuccessResponseDTO } from '../../utils/success-response.dto';

@ApiTags('certificates')
@ApiBearerAuth('access-token')
@Controller('certificate')
@UseInterceptors(ExceptionInterceptor)
export class CertificateController {
    constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

    @Get('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard, BlockchainAccountGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: CertificateDTO,
        description: 'Returns a Certificate'
    })
    public async get(
        @Param('id', new ParseIntPipe()) id: number,
        @BlockchainAccountsDecorator() blockchainAccount: IBlockchainAccount
    ): Promise<CertificateDTO> {
        return this.queryBus.execute(new GetCertificateQuery(id, blockchainAccount.address));
    }

    @Get('/token-id/:tokenId')
    @UseGuards(AuthGuard(), ActiveUserGuard, BlockchainAccountGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: CertificateDTO,
        description: 'Returns a Certificate by token ID'
    })
    public async getByTokenId(
        @Param('tokenId', new ParseIntPipe()) tokenId: number,
        @BlockchainAccountsDecorator() blockchainAccount: IBlockchainAccount
    ): Promise<CertificateDTO> {
        return this.queryBus.execute(
            new GetCertificateByTokenIdQuery(tokenId, blockchainAccount.address)
        );
    }

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard, BlockchainAccountGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: [CertificateDTO],
        description: 'Returns all Certificates'
    })
    public async getAll(
        @BlockchainAccountsDecorator() blockchainAccount: IBlockchainAccount
    ): Promise<CertificateDTO[]> {
        return this.queryBus.execute(new GetAllCertificatesQuery(blockchainAccount.address));
    }

    @Get('/issuer/certified/:deviceId')
    @UseGuards(AuthGuard(), ActiveUserGuard, BlockchainAccountGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: String,
        description: 'Returns SUM of certified energy by device ID'
    })
    public async getAggregateCertifiedEnergyByDeviceId(
        @Param('deviceId') deviceId: string,
        @Query('start') start: string,
        @Query('end') end: string,
        @BlockchainAccountsDecorator() blockchainAccount: IBlockchainAccount
    ): Promise<string> {
        const startDateToUnix = moment(start).unix();
        const endDateToUnix = moment(end).unix();

        return this.queryBus.execute(
            new GetAggregateCertifiedEnergyByDeviceIdQuery(
                deviceId,
                startDateToUnix,
                endDateToUnix,
                blockchainAccount.address
            )
        );
    }

    @Post()
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard, BlockchainAccountGuard)
    @Roles(Role.Issuer)
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: CertificateDTO,
        description: 'Returns the issued Certificate'
    })
    @ApiBody({ type: IssueCertificateDTO })
    public async issue(
        @BlockchainAccountsDecorator() blockchainAccount: IBlockchainAccount,
        @Body() dto: IssueCertificateDTO
    ): Promise<CertificateDTO> {
        return this.commandBus.execute(
            new IssueCertificateCommand(
                dto.to,
                dto.energy,
                dto.fromTime,
                dto.toTime,
                dto.deviceId,
                blockchainAccount.address,
                dto.isPrivate
            )
        );
    }

    @Put('/:id/transfer')
    @UseGuards(AuthGuard(), ActiveUserGuard, BlockchainAccountGuard)
    @ApiBody({ type: TransferCertificateDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Returns whether the transfer succeeded'
    })
    public async transfer(
        @BlockchainAccountsDecorator() blockchainAccount: IBlockchainAccount,
        @Param('id', new ParseIntPipe()) certificateId: number,
        @Body() dto: TransferCertificateDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new TransferCertificateCommand(
                certificateId,
                blockchainAccount.address,
                dto.to,
                dto.amount,
                dto.delegated
            )
        );
    }

    @Put('/:id/claim')
    @UseGuards(AuthGuard(), ActiveUserGuard, BlockchainAccountGuard)
    @ApiBody({ type: ClaimCertificateDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Returns whether the claim succeeded'
    })
    public async claim(
        @BlockchainAccountsDecorator() blockchainAccount: IBlockchainAccount,
        @Param('id', new ParseIntPipe()) certificateId: number,
        @Body() dto: ClaimCertificateDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new ClaimCertificateCommand(
                certificateId,
                dto.claimData,
                blockchainAccount.address,
                dto.amount
            )
        );
    }

    @Put('/bulk-claim')
    @UseGuards(AuthGuard(), ActiveUserGuard, BlockchainAccountGuard)
    @ApiBody({ type: BulkClaimCertificatesDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Returns whether the bulk claim succeeded'
    })
    public async bulkClaim(
        @BlockchainAccountsDecorator() blockchainAccount: IBlockchainAccount,
        @Body() dto: BulkClaimCertificatesDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new BulkClaimCertificatesCommand(
                dto.certificateIds,
                dto.claimData,
                blockchainAccount.address
            )
        );
    }

    @Get('/:id/events')
    @UseGuards(AuthGuard(), ActiveUserGuard, BlockchainAccountGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: [CertificateEvent],
        description: 'Returns all the events for a Certificate'
    })
    public async getAllEvents(
        @Param('id', new ParseIntPipe()) id: number
    ): Promise<CertificateEvent[]> {
        return this.queryBus.execute(new GetAllCertificateEventsQuery(id));
    }
}
