import {
    IOwnershipCommitmentProofWithTx,
    ICertificateOwnership,
    CommitmentStatus
} from '@energyweb/origin-backend-core';

import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    NotFoundException,
    ConflictException,
    Put
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { bigNumberify } from 'ethers/utils';
import { CertificationRequest } from './certification-request.entity';
import { OwnershipCommitment } from './ownership-commitment.entity';
import { StorageErrors } from '../../enums/StorageErrors';
import { Certificate } from './certificate.entity';
import { CertificationRequestDTO } from './certification-request.dto';

const CERTIFICATION_REQUEST_ENDPOINT = '/CertificationRequest';

@Controller('/Certificate')
export class CertificateController {
    constructor(
        @InjectRepository(Certificate)
        private readonly certificateRepository: Repository<Certificate>,
        @InjectRepository(CertificationRequest)
        private readonly certificationRequestRepository: Repository<CertificationRequest>,
        @InjectRepository(OwnershipCommitment)
        private readonly ownershipCommitmentRepository: Repository<OwnershipCommitment>
    ) {}

    @Post(`${CERTIFICATION_REQUEST_ENDPOINT}/:id`)
    async updateCertificationRequest(
        @Param('id') id: number,
        @Body() data: CertificationRequestDTO
    ): Promise<CertificationRequest> {
        let certificationRequest = await this.certificationRequestRepository.findOne(id);

        console.log({
            certificationRequest,
            data
        });

        if (!certificationRequest) {
            certificationRequest = new CertificationRequest();
        }

        certificationRequest.energy = bigNumberify(data.energy);
        certificationRequest.files = data.files;

        return this.certificationRequestRepository.save(certificationRequest);
    }

    @Get(`${CERTIFICATION_REQUEST_ENDPOINT}/:id`)
    async getCertificationRequest(@Param('id') id: string): Promise<CertificationRequest> {
        return this.certificationRequestRepository.findOne(id);
    }

    @Get('/:id')
    async getCertificate(@Param('id') id: number): Promise<ICertificateOwnership> {
        const certificate = await this.certificateRepository.findOne(id);

        if (!certificate) {
            throw new NotFoundException(`getCertificate(): ${StorageErrors.NON_EXISTENT}`);
        }

        return certificate;
    }

    @Get(`/:id/OwnershipCommitment`)
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

        await certificate.save();

        return certificate.currentOwnershipCommitment;
    }

    @Post(`/:id/OwnershipCommitment`)
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

            await certificate.save();

            return {
                commitmentStatus: CommitmentStatus.CURRENT,
                message: `Commitment ${proof.rootHash} saved as the current commitment for certificate #${id}`
            };
        }
        if (currentOwnershipCommitment && !pendingOwnershipCommitment) {
            await this.ownershipCommitmentRepository.save(newCommitment);
            certificate.pendingOwnershipCommitment = newCommitment;

            await certificate.save();

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
