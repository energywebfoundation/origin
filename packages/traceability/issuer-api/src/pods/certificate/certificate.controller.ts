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
    Get,
    Post,
    UseGuards,
    Param,
    ParseIntPipe,
    Put,
    UseInterceptors,
    HttpStatus,
    Query,
    UsePipes,
    ValidationPipe,
    NotFoundException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Role } from '@energyweb/origin-backend-core';

import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import moment from 'moment';
import { BigNumber } from 'ethers';
import { IssueCertificateCommand } from './commands/issue-certificate.command';
import { IssueCertificateDTO } from './commands/issue-certificate.dto';
import { GetAllCertificatesQuery } from './queries/get-all-certificates.query';
import { GetCertificateQuery } from './queries/get-certificate.query';
import { TransferCertificateCommand } from './commands/transfer-certificate.command';
import { TransferCertificateDTO } from './commands/transfer-certificate.dto';
import { ClaimCertificateDTO } from './commands/claim-certificate.dto';
import { ClaimCertificateCommand } from './commands/claim-certificate.command';
import { GetAggregateCertifiedEnergyByDeviceIdQuery } from './queries/get-aggregate-certified-energy-by-device.query';
import { BulkClaimCertificatesCommand } from './commands/bulk-claim-certificates.command';
import { BulkClaimCertificatesDTO } from './commands/bulk-claim-certificates.dto';
import { CertificateEvent } from '../../types';
import { GetAllCertificateEventsQuery } from './queries/get-all-certificate-events.query';
import { CertificateDTO } from './certificate.dto';
import { SuccessResponseDTO } from '../../utils/success-response.dto';
import { certificateToDto } from './utils';
import { Certificate } from './certificate.entity';

@ApiTags('certificates')
@ApiBearerAuth('access-token')
@Controller('certificate')
@UsePipes(ValidationPipe)
export class CertificateController {
    constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

    @Get('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: CertificateDTO,
        description: 'Returns a Certificate'
    })
    public async get(
        @Param('id', new ParseIntPipe()) id: number,
        @BlockchainAccountDecorator() blockchainAddress: string
    ): Promise<CertificateDTO> {
        const certificate = await this.queryBus.execute<GetCertificateQuery, Certificate>(
            new GetCertificateQuery(id)
        );

        if (!certificate) {
            throw new NotFoundException(`Certificate with ID ${id} does not exist.`);
        }

        return certificateToDto(certificate, blockchainAddress);
    }

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: [CertificateDTO],
        description: 'Returns all Certificates'
    })
    public async getAll(
        @BlockchainAccountDecorator() blockchainAddress: string
    ): Promise<CertificateDTO[]> {
        const certificates = await this.queryBus.execute<GetAllCertificatesQuery, Certificate[]>(
            new GetAllCertificatesQuery()
        );
        return Promise.all(
            certificates.map((certificate) => certificateToDto(certificate, blockchainAddress))
        );
    }

    @Get('/issuer/certified/:deviceId')
    @ApiResponse({
        status: HttpStatus.OK,
        type: String,
        description: 'Returns SUM of certified energy by device ID'
    })
    public async getAggregateCertifiedEnergyByDeviceId(
        @Param('deviceId') deviceId: string,
        @Query('start') start: string,
        @Query('end') end: string
    ): Promise<string> {
        const startDateToUnix = moment(start).unix();
        const endDateToUnix = moment(end).unix();

        const result = await this.queryBus.execute<
            GetAggregateCertifiedEnergyByDeviceIdQuery,
            BigNumber
        >(new GetAggregateCertifiedEnergyByDeviceIdQuery(deviceId, startDateToUnix, endDateToUnix));

        return result.toString();
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
        @BlockchainAccountDecorator() blockchainAddress: string,
        @Body() dto: IssueCertificateDTO
    ): Promise<CertificateDTO> {
        return this.commandBus.execute(
            new IssueCertificateCommand(
                dto.to,
                dto.energy,
                dto.fromTime,
                dto.toTime,
                dto.deviceId,
                blockchainAddress,
                dto.isPrivate,
                dto.metadata
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
        @BlockchainAccountDecorator() blockchainAddress: string,
        @Param('id', new ParseIntPipe()) certificateId: number,
        @Body() dto: TransferCertificateDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new TransferCertificateCommand(
                certificateId,
                blockchainAddress,
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
        @BlockchainAccountDecorator() blockchainAddress: string,
        @Param('id', new ParseIntPipe()) certificateId: number,
        @Body() dto: ClaimCertificateDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new ClaimCertificateCommand(certificateId, dto.claimData, blockchainAddress, dto.amount)
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
        @BlockchainAccountDecorator() blockchainAddress: string,
        @Body() dto: BulkClaimCertificatesDTO
    ): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(
            new BulkClaimCertificatesCommand(dto.certificateIds, dto.claimData, blockchainAddress)
        );
    }

    @Get('/:id/events')
    @UseGuards(AuthGuard(), ActiveUserGuard)
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
