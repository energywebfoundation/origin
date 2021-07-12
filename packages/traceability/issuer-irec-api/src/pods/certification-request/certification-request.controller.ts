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
    UserDecorator
} from '@energyweb/origin-backend-utils';
import {
    CertificateBoundToCertificationRequestCommand,
    CreateCertificationRequestDTO,
    GetAllCertificationRequestsQuery,
    GetCertificationRequestByCertificateQuery,
    GetCertificationRequestQuery,
    RevokeCertificationRequestCommand,
    SuccessResponseDTO,
    ValidateCertificationRequestCommand
} from '@energyweb/issuer-api';
import {
    ApproveIrecCertificationRequestCommand,
    CreateIrecCertificationRequestCommand
} from './commands';
import { FullCertificationRequestDTO } from './full-certification-request.dto';
import {
    ILoggedInUser,
    ISuccessResponse,
    ResponseFailure,
    Role,
    ValidateDeviceOwnershipQuery
} from '@energyweb/origin-backend-core';

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
    public async getAll(
        @UserDecorator() user: ILoggedInUser
    ): Promise<FullCertificationRequestDTO[]> {
        const fullAccessRoles = [Role.Issuer, Role.Admin];
        if (fullAccessRoles.some((role) => user.hasRole(role))) {
            return this.queryBus.execute(new GetAllCertificationRequestsQuery());
        }

        return this.queryBus.execute(
            new GetAllCertificationRequestsQuery({ owner: user.blockchainAccountAddress })
        );
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
    @ApiBody({ type: CreateCertificationRequestDTO })
    public async create(
        @UserDecorator() user: ILoggedInUser,
        @Body() dto: CreateCertificationRequestDTO
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

        return this.commandBus.execute(
            new CreateIrecCertificationRequestCommand(
                user,
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
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Approves a Certification Request'
    })
    public async approve(@Param('id', new ParseIntPipe()) id: number): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(new ApproveIrecCertificationRequestCommand(id));
    }

    @Put('/:id/revoke')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Issuer, Role.Admin)
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Revokes a Certification Request'
    })
    public async revoke(@Param('id', new ParseIntPipe()) id: number): Promise<SuccessResponseDTO> {
        return this.commandBus.execute(new RevokeCertificationRequestCommand(id));
    }
}
