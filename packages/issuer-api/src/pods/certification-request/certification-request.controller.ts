import { ActiveUserGuard, RolesGuard, Roles } from '@energyweb/origin-backend-utils';
import { Body, Controller, Get, Post, UseGuards, Param, ParseIntPipe, Put } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ISuccessResponse, Role } from '@energyweb/origin-backend-core';

import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateCertificationRequestCommand } from './commands/create-certification-request.command';
import { CreateCertificationRequestDTO } from './commands/create-certification-request.dto';
import { GetAllCertificationRequestsQuery } from './queries/get-all-certification-requests.query';
import { GetCertificationRequestQuery } from './queries/get-certification-request.query';
import { ApproveCertificationRequestCommand } from './commands/approve-certification-request.command';
import { RevokeCertificationRequestCommand } from './commands/revoke-certification-request.command';
import { GetCertificationRequestByCertificateQuery } from './queries/get-certification-request-by-certificate.query';
import { CertificationRequestDTO } from './certification-request.dto';
import { SuccessResponseDTO } from '../../utils/success-response.dto';
import { ValidateCertificationRequestCommand } from './commands/validate-certification-request.command';
import { CertificateBoundToCertificationRequestCommand } from './commands/certificate-bound-to-certification-request.command';
import { ExceptionController } from '../../utils/ExceptionController';

@ApiTags('certification-requests')
@Controller('certification-request')
export class CertificationRequestController extends ExceptionController {
    constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {
        super();
    }

    @Get('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: 200,
        type: CertificationRequestDTO,
        description: 'Returns a Certification Request'
    })
    public async get(
        @Param('id', new ParseIntPipe()) id: number
    ): Promise<CertificationRequestDTO> {
        return this.queryBus.execute(new GetCertificationRequestQuery(id));
    }

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: 200,
        type: [CertificationRequestDTO],
        description: 'Returns all Certification Requests'
    })
    public async getAll(): Promise<CertificationRequestDTO[]> {
        return this.queryBus.execute(new GetAllCertificationRequestsQuery());
    }

    @Get('/:certificateId')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: 200,
        type: CertificationRequestDTO,
        description: 'Returns a Certification Request by a certificate ID'
    })
    public async getByCertificate(
        @Param('certificateId', new ParseIntPipe()) certificateId: number
    ): Promise<CertificationRequestDTO> {
        const validationCheck = await this.queryBus.execute<
            CertificateBoundToCertificationRequestCommand,
            ISuccessResponse
        >(new CertificateBoundToCertificationRequestCommand(certificateId));

        this.throwIfNotSuccess(validationCheck);

        return this.queryBus.execute(new GetCertificationRequestByCertificateQuery(certificateId));
    }

    @Post()
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Issuer, Role.Admin, Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    @ApiResponse({
        status: 200,
        type: CertificationRequestDTO,
        description: 'Creates a Certification Request'
    })
    @ApiBody({ type: CreateCertificationRequestDTO })
    public async create(
        @Body() dto: CreateCertificationRequestDTO
    ): Promise<CertificationRequestDTO> {
        const validationCheck = await this.commandBus.execute(
            new ValidateCertificationRequestCommand(dto)
        );

        this.throwIfNotSuccess(validationCheck);

        return this.commandBus.execute(
            new CreateCertificationRequestCommand(
                dto.to,
                dto.energy,
                dto.fromTime,
                dto.toTime,
                dto.deviceId,
                dto.files,
                dto.isPrivate
            )
        );
    }

    @Put('/:id/approve')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Issuer, Role.Admin)
    @ApiResponse({
        status: 200,
        type: SuccessResponseDTO,
        description: 'Approves a Certification Request'
    })
    public async approve(@Param('id', new ParseIntPipe()) id: number): Promise<SuccessResponseDTO> {
        const response = await this.commandBus.execute(new ApproveCertificationRequestCommand(id));

        this.throwIfNotSuccess(response);

        return response;
    }

    @Put('/:id/revoke')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Issuer, Role.Admin)
    @ApiResponse({
        status: 200,
        type: SuccessResponseDTO,
        description: 'Revokes a Certification Request'
    })
    public async revoke(@Param('id', new ParseIntPipe()) id: number): Promise<SuccessResponseDTO> {
        const response = await this.commandBus.execute(new RevokeCertificationRequestCommand(id));

        this.throwIfNotSuccess(response);

        return response;
    }
}
