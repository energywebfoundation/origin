import { ActiveUserGuard, RolesGuard, Roles } from '@energyweb/origin-backend-utils';
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
import { Role } from '@energyweb/origin-backend-core';

import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateCertificationRequestCommand } from './commands/create-certification-request.command';
import { ICreateCertificationRequestDTO } from './commands/create-certification-request.dto';
import { GetAllCertificationRequestsQuery } from './queries/get-all-certification-requests.query';
import { GetCertificationRequestQuery } from './queries/get-certification-request.query';
import { ApproveCertificationRequestCommand } from './commands/approve-certification-request.command';
import { RevokeCertificationRequestCommand } from './commands/revoke-certification-request.command';
import { GetCertificationRequestByCertificateQuery } from './queries/get-certification-request-by-certificate.query';
import { ICertificationRequestDTO } from './certification-request.dto';
import { ISuccessResponseDTO } from '../../utils/success-response.dto';

@ApiTags('certification-requests')
@Controller('certification-request')
export class CertificationRequestController {
    private readonly logger = new Logger(CertificationRequestController.name);

    constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

    @Get('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: 200,
        type: ICertificationRequestDTO,
        description: 'Returns a Certification Request'
    })
    public async get(
        @Param('id', new ParseIntPipe()) id: number
    ): Promise<ICertificationRequestDTO> {
        return this.queryBus.execute(new GetCertificationRequestQuery(id));
    }

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: 200,
        type: [ICertificationRequestDTO],
        description: 'Returns all Certification Requests'
    })
    public async getAll(): Promise<ICertificationRequestDTO[]> {
        return this.queryBus.execute(new GetAllCertificationRequestsQuery());
    }

    @Get('/:certificateId')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: 200,
        type: ICertificationRequestDTO,
        description: 'Returns a Certification Request by a certificate ID'
    })
    public async getByCertificate(
        @Param('certificateId', new ParseIntPipe()) certificateId: number
    ): Promise<ICertificationRequestDTO> {
        return this.queryBus.execute(new GetCertificationRequestByCertificateQuery(certificateId));
    }

    @Post()
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Issuer, Role.Admin, Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    @ApiResponse({
        status: 200,
        type: ICertificationRequestDTO,
        description: 'Creates a Certification Request'
    })
    @ApiBody({ type: ICreateCertificationRequestDTO })
    public async create(
        @Body() dto: ICreateCertificationRequestDTO
    ): Promise<ICertificationRequestDTO> {
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
        type: ISuccessResponseDTO,
        description: 'Approves a Certification Request'
    })
    public async approve(
        @Param('id', new ParseIntPipe()) id: number
    ): Promise<ISuccessResponseDTO> {
        return this.commandBus.execute(new ApproveCertificationRequestCommand(id));
    }

    @Put('/:id/revoke')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Issuer, Role.Admin)
    @ApiResponse({
        status: 200,
        type: ISuccessResponseDTO,
        description: 'Revokes a Certification Request'
    })
    public async revoke(@Param('id', new ParseIntPipe()) id: number): Promise<ISuccessResponseDTO> {
        return this.commandBus.execute(new RevokeCertificationRequestCommand(id));
    }
}
