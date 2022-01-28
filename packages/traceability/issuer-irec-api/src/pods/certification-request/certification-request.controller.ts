import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Put,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
    ActiveUserGuard,
    ExceptionInterceptor,
    Roles,
    RolesGuard,
    SuccessResponseDTO,
    UserDecorator
} from '@energyweb/origin-backend-utils';
import {
    CertificateBoundToCertificationRequestCommand,
    GetAllCertificationRequestsQuery,
    GetCertificationRequestByCertificateQuery,
    GetCertificationRequestQuery,
    ValidateCertificationRequestCommand
} from '@energyweb/issuer-api';
import {
    ILoggedInUser,
    ISuccessResponse,
    ResponseFailure,
    Role,
    ValidateDeviceOwnershipQuery
} from '@energyweb/origin-backend-core';

import {
    ApproveIrecCertificationRequestCommand,
    CreateIrecCertificationRequestCommand,
    RevokeIrecCertificationRequestCommand
} from './commands';
import { FullCertificationRequestDTO } from './full-certification-request.dto';
import { CreateIrecCertificationRequestDTO } from './create-irec-certification-request.dto';

@ApiTags('irec-certification-requests')
@ApiBearerAuth('access-token')
@Controller('/irec/certification-request')
@UseInterceptors(ExceptionInterceptor)
export class CertificationRequestController {
    constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

    @Get('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: FullCertificationRequestDTO,
        description: 'Returns a Certification Request'
    })
    public async get(
        @Param('id', new ParseIntPipe()) id: number
    ): Promise<FullCertificationRequestDTO> {
        return this.queryBus.execute(new GetCertificationRequestQuery(id));
    }

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: [FullCertificationRequestDTO],
        description: 'Returns all Certification Requests'
    })
    public async getAll(): Promise<FullCertificationRequestDTO[]> {
        return this.queryBus.execute(new GetAllCertificationRequestsQuery());
    }

    @Get('/:certificateId')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: FullCertificationRequestDTO,
        description: 'Returns a Certification Request by a certificate ID'
    })
    public async getByCertificate(
        @Param('certificateId', new ParseIntPipe()) certificateId: number
    ): Promise<FullCertificationRequestDTO | SuccessResponseDTO> {
        const validationCheck = await this.queryBus.execute<
            CertificateBoundToCertificationRequestCommand,
            ISuccessResponse
        >(new CertificateBoundToCertificationRequestCommand(certificateId));

        if (!validationCheck.success) {
            return validationCheck;
        }

        return this.queryBus.execute(new GetCertificationRequestByCertificateQuery(certificateId));
    }

    @Post()
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Issuer, Role.Admin, Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    @ApiResponse({
        status: HttpStatus.OK,
        type: FullCertificationRequestDTO,
        description: 'Creates a Certification Request'
    })
    @ApiBody({ type: CreateIrecCertificationRequestDTO })
    public async create(
        @UserDecorator() user: ILoggedInUser,
        @Body() dto: CreateIrecCertificationRequestDTO
    ): Promise<FullCertificationRequestDTO | SuccessResponseDTO> {
        const isOwnerOfTheDevice = await this.queryBus.execute(
            new ValidateDeviceOwnershipQuery(user.ownerId, dto.deviceId)
        );

        if (!isOwnerOfTheDevice) {
            return ResponseFailure('Not a device owner', HttpStatus.FORBIDDEN);
        }

        const validationCheck = await this.commandBus.execute(
            new ValidateCertificationRequestCommand(dto)
        );

        if (!validationCheck.success) {
            return validationCheck;
        }

        return this.commandBus.execute(new CreateIrecCertificationRequestCommand(user, dto));
    }

    @Put('/:id/approve')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Issuer, Role.Admin)
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Approves a Certification Request'
    })
    public async approve(
        @Param('id', new ParseIntPipe()) id: number,
        @UserDecorator() user: ILoggedInUser
    ): Promise<SuccessResponseDTO> {
        const command = new ApproveIrecCertificationRequestCommand(id, user.organizationId);
        return this.commandBus.execute(command);
    }

    @Put('/:id/revoke')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Issuer, Role.Admin)
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Revokes a Certification Request'
    })
    public async revoke(
        @Param('id', new ParseIntPipe()) id: number,
        @UserDecorator() user: ILoggedInUser
    ): Promise<SuccessResponseDTO> {
        const command = new RevokeIrecCertificationRequestCommand(id, user.organizationId);
        return this.commandBus.execute(command);
    }
}
