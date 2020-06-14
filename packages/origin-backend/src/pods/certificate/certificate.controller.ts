import {
    ILoggedInUser,
    IOwnershipCommitmentProofWithTx,
    Role,
    ISuccessResponse
} from '@energyweb/origin-backend-core';
import { Roles, RolesGuard, UserDecorator, ActiveUserGuard } from '@energyweb/origin-backend-utils';
import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    Post,
    UseGuards,
    Put,
    Query
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { StorageErrors } from '../../enums/StorageErrors';
import { CertificationRequestQueueItemDTO } from './certification-request-queue-item.dto';
import { CertificationRequest } from './certification-request.entity';
import { CertificationRequestService } from './certification-request.service';
import { CertificateService } from './certificate.service';
import { CertificationRequestQueueItem } from './certification-request-queue-item.entity';

const CERTIFICATION_REQUEST_ENDPOINT = '/CertificationRequest';

@Controller('/Certificate')
export class CertificateController {
    constructor(
        private readonly certificateService: CertificateService,
        private readonly certificationRequestService: CertificationRequestService
    ) {}

    @Post(CERTIFICATION_REQUEST_ENDPOINT)
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    async queueCertificationRequestData(
        @Body() dto: CertificationRequestQueueItemDTO,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<CertificationRequestQueueItem> {
        return this.certificationRequestService.queue(dto, loggedUser);
    }

    @Get(`${CERTIFICATION_REQUEST_ENDPOINT}/validate`)
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    async validateGenerationPeriod(
        @Query('fromTime') fromTime: number,
        @Query('toTime') toTime: number,
        @Query('deviceId') deviceId: string,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<ISuccessResponse> {
        return this.certificationRequestService.validateGenerationPeriod(
            { fromTime, toTime, deviceId },
            loggedUser
        );
    }

    @Get(`${CERTIFICATION_REQUEST_ENDPOINT}/:id`)
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.Issuer, Role.Admin)
    async getCertificationRequest(
        @Param('id') id: number,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<CertificationRequest> {
        const request = await this.certificationRequestService.get(id);

        if (!request) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        if (loggedUser.hasRole(Role.Issuer, Role.Admin) || request.userId === loggedUser.ownerId) {
            return request;
        }

        return {
            id: request.id,
            created: request.created,
            energy: request.energy,
            device: request.device
        } as CertificationRequest;
    }

    @Get(CERTIFICATION_REQUEST_ENDPOINT)
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.Issuer, Role.Admin)
    async getAllCertificationRequests(
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<CertificationRequest[]> {
        if (loggedUser.hasRole(Role.Issuer, Role.Admin)) {
            return this.certificationRequestService.getAll();
        }

        return this.certificationRequestService.getAll({
            where: { userId: loggedUser.ownerId }
        });
    }

    // TODO: add ownership management and roles

    @Get(`/:id/OwnershipCommitment`)
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationUser)
    async getOwnershipCommitment(
        @Param('id') id: number
    ): Promise<IOwnershipCommitmentProofWithTx> {
        const certificate = await this.certificateService.get(id);

        if (!certificate?.currentOwnershipCommitment) {
            throw new NotFoundException(`getOwnershipCommitment(): ${StorageErrors.NON_EXISTENT}`);
        }

        return certificate.currentOwnershipCommitment;
    }

    @Put(`/:id/OwnershipCommitment`)
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationUser)
    async addOwnershipCommitment(
        @Param('id') id: number,
        @Body() proof: IOwnershipCommitmentProofWithTx,
        @UserDecorator() loggedUser: ILoggedInUser
    ) {
        return this.certificateService.addOwnershipCommitment(id, proof, loggedUser);
    }
}
