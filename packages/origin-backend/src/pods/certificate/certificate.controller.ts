import {
    ILoggedInUser,
    IOwnershipCommitmentProofWithTx,
    Role
} from '@energyweb/origin-backend-core';
import { Roles, RolesGuard, UserDecorator } from '@energyweb/origin-backend-utils';
import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    Post,
    UseGuards,
    Put
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { StorageErrors } from '../../enums/StorageErrors';
import { CertificationRequestUpdateDTO } from './certification-request.dto';
import { CertificationRequest } from './certification-request.entity';
import { CertificationRequestService } from './certification-request.service';
import { CertificateService } from './certificate.service';

const CERTIFICATION_REQUEST_ENDPOINT = '/CertificationRequest';

@Controller('/Certificate')
export class CertificateController {
    constructor(
        private readonly certificateService: CertificateService,
        private readonly certificationRequestService: CertificationRequestService
    ) {}

    @Post(`${CERTIFICATION_REQUEST_ENDPOINT}/:id`)
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    async updateCertificationRequest(
        @Param('id') id: number,
        @Body() data: CertificationRequestUpdateDTO,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<CertificationRequest> {
        return this.certificationRequestService.update(id, data, loggedUser);
    }

    @Get(`${CERTIFICATION_REQUEST_ENDPOINT}/:id`)
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.Issuer, Role.Admin)
    async getCertificationRequest(
        @Param('id') id: number,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<CertificationRequest> {
        if (loggedUser.hasRole(Role.Issuer, Role.Admin)) {
            return this.certificationRequestService.get(id);
        }

        return this.certificationRequestService.get(id, {
            where: { userId: loggedUser.ownerId }
        });
    }

    @Get(CERTIFICATION_REQUEST_ENDPOINT)
    @UseGuards(AuthGuard(), RolesGuard)
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
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationUser)
    async getOwnershipCommitment(
        @Param('id') id: number
    ): Promise<IOwnershipCommitmentProofWithTx> {
        const certificate = await this.certificateService.get(id);
        console.log({
            certificate
        });

        if (!certificate?.currentOwnershipCommitment) {
            throw new NotFoundException(`getOwnershipCommitment(): ${StorageErrors.NON_EXISTENT}`);
        }

        return certificate.currentOwnershipCommitment;
    }

    @Put(`/:id/OwnershipCommitment`)
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationUser)
    async addOwnershipCommitment(
        @Param('id') id: number,
        @Body() proof: IOwnershipCommitmentProofWithTx,
        @UserDecorator() loggedUser: ILoggedInUser
    ) {
        return this.certificateService.addOwnershipCommitment(id, proof, loggedUser);
    }
}
