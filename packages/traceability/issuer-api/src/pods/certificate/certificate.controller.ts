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
    NotFoundException,
    HttpCode
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Role } from '@energyweb/origin-backend-core';

import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import moment from 'moment';
import { BigNumber } from 'ethers';
import { CertificateEvent } from '../../types';
import { certificateToDto } from './utils';
import { Certificate } from './certificate.entity';

import {
    GetAggregateCertifiedEnergyByDeviceIdQuery,
    GetAllCertificateEventsQuery,
    GetAllCertificatesQuery,
    GetCertificateByTxHashQuery,
    GetCertificateQuery
} from './queries';
import {
    ClaimCertificateCommand,
    IssueCertificateCommand,
    TransferCertificateCommand
} from './commands';
import {
    CertificateDTO,
    ClaimCertificateDTO,
    IssueCertificateDTO,
    TransferCertificateDTO
} from './dto';
import { TxHashDTO } from './dto/tx-hash.dto';

@ApiTags('certificates')
@ApiBearerAuth('access-token')
@Controller('certificate')
@UseInterceptors(ExceptionInterceptor)
@UsePipes(ValidationPipe)
export class CertificateController {
    constructor(public readonly commandBus: CommandBus, public readonly queryBus: QueryBus) {}

    @Get('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiOkResponse({
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

    @Get('/by-transaction/:txHash')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiOkResponse({
        type: [CertificateDTO],
        description: 'Returns Certificates that were created in the transaction'
    })
    public async getByTxHash(
        @Param('txHash') txHash: string,
        @BlockchainAccountDecorator() blockchainAddress: string
    ): Promise<CertificateDTO[]> {
        const certificates = await this.queryBus.execute<
            GetCertificateByTxHashQuery,
            Certificate[]
        >(new GetCertificateByTxHashQuery(txHash));

        if (certificates?.length === 0) {
            throw new NotFoundException(
                `No certificates were issued in the tx with hash ${txHash}.`
            );
        }

        return certificates.map((cert) => certificateToDto(cert, blockchainAddress));
    }

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiOkResponse({
        type: [CertificateDTO],
        description: 'Returns all Certificates'
    })
    @ApiQuery({
        name: 'generationEndFrom',
        description: 'Date-alike filter for `generationEnd` field (lower boundary)',
        required: false
    })
    @ApiQuery({
        name: 'generationEndTo',
        description: 'Date-alike filter for `generationEnd` field (upper boundary)',
        required: false
    })
    @ApiQuery({
        name: 'generationStartFrom',
        description: 'Date-alike filter for `generationStart` field (upper boundary)',
        required: false
    })
    @ApiQuery({
        name: 'generationStartTo',
        description: 'Date-alike filter for `generationStart` field (upper boundary)',
        required: false
    })
    @ApiQuery({
        name: 'creationTimeFrom',
        description: 'Date-alike filter for `creationTime` field (upper boundary)',
        required: false
    })
    @ApiQuery({
        name: 'creationTimeTo',
        description: 'Date-alike filter for `creationTime` field (upper boundary)',
        required: false
    })
    @ApiQuery({
        name: 'deviceId',
        description: 'Filter for deviceId field',
        required: false
    })
    public async getAll(
        @BlockchainAccountDecorator() blockchainAddress: string,
        @Query('generationEndFrom') generationEndFrom?: string,
        @Query('generationEndTo') generationEndTo?: string,
        @Query('generationStartFrom') generationStartFrom?: string,
        @Query('generationStartTo') generationStartTo?: string,
        @Query('creationTimeFrom') creationTimeFrom?: string,
        @Query('creationTimeTo') creationTimeTo?: string,
        @Query('deviceId') deviceId?: string
    ): Promise<CertificateDTO[]> {
        const certificates = await this.queryBus.execute<GetAllCertificatesQuery, Certificate[]>(
            new GetAllCertificatesQuery({
                generationEndFrom: generationEndFrom ? new Date(generationEndFrom) : undefined,
                generationEndTo: generationEndTo ? new Date(generationEndTo) : undefined,
                generationStartFrom: generationStartFrom
                    ? new Date(generationStartFrom)
                    : undefined,
                generationStartTo: generationStartTo ? new Date(generationStartTo) : undefined,
                creationTimeFrom: creationTimeFrom ? new Date(creationTimeFrom) : undefined,
                creationTimeTo: creationTimeTo ? new Date(creationTimeTo) : undefined,
                deviceId
            })
        );
        return certificates.map((certificate) => certificateToDto(certificate, blockchainAddress));
    }

    @Get('/issuer/certified/:deviceId')
    @ApiOkResponse({
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
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard, BlockchainAccountGuard)
    @Roles(Role.Issuer)
    @ApiOkResponse({
        type: TxHashDTO,
        description: 'Triggers an issuance transaction and returns the transaction hash'
    })
    @ApiBody({ type: IssueCertificateDTO })
    public async issue(
        @BlockchainAccountDecorator() blockchainAddress: string,
        @Body() dto: IssueCertificateDTO
    ): Promise<TxHashDTO> {
        const tx = await this.commandBus.execute(
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

        return { txHash: tx.hash };
    }

    @Put('/:id/transfer')
    @UseGuards(AuthGuard(), ActiveUserGuard, BlockchainAccountGuard)
    @ApiBody({ type: TransferCertificateDTO })
    @ApiOkResponse({
        type: TxHashDTO,
        description: 'Triggers a Transfer transaction and returns the transaction hash'
    })
    public async transfer(
        @BlockchainAccountDecorator() blockchainAddress: string,
        @Param('id', new ParseIntPipe()) certificateId: number,
        @Body() dto: TransferCertificateDTO
    ): Promise<TxHashDTO> {
        const tx = await this.commandBus.execute(
            new TransferCertificateCommand(
                certificateId,
                blockchainAddress,
                dto.to,
                dto.amount,
                dto.delegated
            )
        );

        return { txHash: tx.hash };
    }

    @Put('/:id/claim')
    @UseGuards(AuthGuard(), ActiveUserGuard, BlockchainAccountGuard)
    @ApiBody({ type: ClaimCertificateDTO })
    @ApiOkResponse({
        type: TxHashDTO,
        description: 'Triggers a Transfer transaction and returns the transaction hash'
    })
    public async claim(
        @BlockchainAccountDecorator() blockchainAddress: string,
        @Param('id', new ParseIntPipe()) certificateId: number,
        @Body() dto: ClaimCertificateDTO
    ): Promise<TxHashDTO> {
        const tx = await this.commandBus.execute(
            new ClaimCertificateCommand(certificateId, dto.claimData, blockchainAddress, dto.amount)
        );

        return { txHash: tx.hash };
    }

    @Get('/:id/events')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiOkResponse({
        type: [CertificateEvent],
        description: 'Returns all the events for a Certificate'
    })
    public async getAllEvents(
        @Param('id', new ParseIntPipe()) id: number
    ): Promise<CertificateEvent[]> {
        return this.queryBus.execute(new GetAllCertificateEventsQuery(id));
    }
}
