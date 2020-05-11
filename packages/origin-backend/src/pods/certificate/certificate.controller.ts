import {
    CommitmentStatus,
    ICertificateOwnership,
    ILoggedInUser,
    IOwnershipCommitmentProofWithTx,
    Role
} from '@energyweb/origin-backend-core';
import { Roles, RolesGuard, UserDecorator } from '@energyweb/origin-backend-utils';
import {
    Body,
    ConflictException,
    Controller,
    Get,
    NotFoundException,
    Param,
    Post,
    Put,
    UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StorageErrors } from '../../enums/StorageErrors';
import { Certificate } from './certificate.entity';
import { CertificationRequestUpdateDTO } from './certification-request.dto';
import { CertificationRequest } from './certification-request.entity';
import { CertificationRequestService } from './certification-request.service';
import { OwnershipCommitment } from './ownership-commitment.entity';

const CERTIFICATION_REQUEST_ENDPOINT = '/CertificationRequest';

@Controller('/Certificate')
export class CertificateController {
    constructor(
        @InjectRepository(Certificate)
        private readonly certificateRepository: Repository<Certificate>,
        private readonly certificationRequestService: CertificationRequestService,
        @InjectRepository(OwnershipCommitment)
        private readonly ownershipCommitmentRepository: Repository<OwnershipCommitment>
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
            where: { userId: loggedUser.organizationId }
        });
    }

    @Get(CERTIFICATION_REQUEST_ENDPOINT)
    @UseGuards(AuthGuard())
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.Issuer, Role.Admin)
    async getAllCertificationRequests(
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<CertificationRequest[]> {
        if (loggedUser.hasRole(Role.Issuer, Role.Admin)) {
            return this.certificationRequestService.getAll();
        }

        return this.certificationRequestService.getAll({
            where: { userId: loggedUser.organizationId }
        });
    }

    @Get('/:id')
    async getCertificate(@Param('id') id: number): Promise<ICertificateOwnership> {
        const certificate = await this.certificateRepository.findOne(id);

        if (!certificate) {
            throw new NotFoundException(`getCertificate(): ${StorageErrors.NON_EXISTENT}`);
        }

        return certificate;
    }

    // TODO: add ownership management and roles

    @Get(`/:id/OwnershipCommitment`)
    @UseGuards(AuthGuard())
    async getOwnershipCommitment(
        @Param('id') id: number
    ): Promise<IOwnershipCommitmentProofWithTx> {
        const certificate = await this.certificateRepository.findOne(id);

        if (!certificate?.currentOwnershipCommitment) {
            throw new NotFoundException(`getOwnershipCommitment(): ${StorageErrors.NON_EXISTENT}`);
        }

        return certificate.currentOwnershipCommitment;
    }

    @Get(`/:id/OwnershipCommitment/pending`)
    @UseGuards(AuthGuard())
    async getPendingOwnershipCommitment(@Param('id') id: number) {
        const certificate = await this.certificateRepository.findOne(id);

        if (!certificate?.pendingOwnershipCommitment) {
            throw new NotFoundException(
                `getPendingOwnershipCommitment(): ${StorageErrors.NON_EXISTENT}`
            );
        }

        return certificate.pendingOwnershipCommitment;
    }

    @Put(`/:id/OwnershipCommitment/pending/approve`)
    @UseGuards(AuthGuard())
    async approvePendingOwnershipCommitment(
        @Param('id') id: number
    ): Promise<IOwnershipCommitmentProofWithTx> {
        const certificate = await this.certificateRepository.findOne(id);

        if (!certificate?.pendingOwnershipCommitment) {
            throw new NotFoundException(
                `approvePendingOwnershipCommitment(): ${StorageErrors.NON_EXISTENT}`
            );
        }

        certificate.ownershipHistory.push(certificate.currentOwnershipCommitment);
        certificate.currentOwnershipCommitment = certificate.pendingOwnershipCommitment;
        certificate.pendingOwnershipCommitment = null;

        await this.certificateRepository.save(certificate);

        return certificate.currentOwnershipCommitment;
    }

    @Post(`/:id/OwnershipCommitment`)
    @UseGuards(AuthGuard())
    async addOwnershipCommitment(
        @Param('id') id: number,
        @Body() proof: IOwnershipCommitmentProofWithTx
    ) {
        const certificate = (await this.certificateRepository.findOne(id)) ?? new Certificate();

        const { currentOwnershipCommitment, pendingOwnershipCommitment } = certificate;

        const newCommitment = new OwnershipCommitment();

        Object.assign(newCommitment, { ...proof });

        if (!currentOwnershipCommitment) {
            await this.ownershipCommitmentRepository.save(newCommitment);
            certificate.currentOwnershipCommitment = newCommitment;

            await this.certificateRepository.save(certificate);

            return {
                commitmentStatus: CommitmentStatus.CURRENT,
                message: `Commitment ${proof.rootHash} saved as the current commitment for certificate #${id}`
            };
        }
        if (currentOwnershipCommitment && !pendingOwnershipCommitment) {
            await this.ownershipCommitmentRepository.save(newCommitment);
            certificate.pendingOwnershipCommitment = newCommitment;

            await this.certificateRepository.save(certificate);

            return {
                commitmentStatus: CommitmentStatus.PENDING,
                message: `Commitment ${proof.rootHash} saved as a pending commitment for certificate #${id}`
            };
        }
        throw new ConflictException({
            commitmentStatus: CommitmentStatus.REJECTED,
            message: `Unable to add a new commitment to certificate #${id}. There is already a pending commitment in the queue.`
        });
    }
}
