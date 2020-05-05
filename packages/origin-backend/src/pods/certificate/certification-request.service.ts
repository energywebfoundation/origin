import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { IUserWithRelationsIds } from '@energyweb/origin-backend-core';
import { getAddress } from 'ethers/utils';
import { CertificationRequest } from './certification-request.entity';
import { CertificationRequestUpdateDTO } from './certification-request.dto';
import { StorageErrors } from '../../enums/StorageErrors';

@Injectable()
export class CertificationRequestService {
    constructor(
        @InjectRepository(CertificationRequest)
        private readonly repository: Repository<CertificationRequest>
    ) {}

    async create(cert: DeepPartial<CertificationRequest>) {
        const certificationRequest = this.repository.create(cert);

        return this.repository.save(certificationRequest);
    }

    async update(
        id: number,
        data: CertificationRequestUpdateDTO,
        loggedUser: IUserWithRelationsIds
    ): Promise<CertificationRequest> {
        const certificationRequest = await this.repository.findOne(id, { relations: ['device'] });

        if (!certificationRequest) {
            throw new NotFoundException(
                `updateCertificationRequest(): ${StorageErrors.NON_EXISTENT}`
            );
        }
        if (
            getAddress(loggedUser.blockchainAccountAddress) !==
            getAddress(certificationRequest.owner)
        ) {
            throw new UnauthorizedException(
                `Logged in user ${loggedUser.blockchainAccountAddress} is not the owner of the request.`
            );
        }

        certificationRequest.energy = data.energy;
        certificationRequest.files = data.files;

        return this.repository.save(certificationRequest);
    }

    async registerApproved(id: number): Promise<CertificationRequest> {
        const certificationRequest = await this.repository.findOne(id);

        if (!certificationRequest) {
            throw new NotFoundException(
                `approveCertificationRequest(): ${StorageErrors.NON_EXISTENT}`
            );
        }

        certificationRequest.approved = true;

        return this.repository.save(certificationRequest);
    }

    async registerRevoked(id: number): Promise<CertificationRequest> {
        const certificationRequest = await this.repository.findOne(id);

        if (!certificationRequest) {
            throw new NotFoundException(
                `approveCertificationRequest(): ${StorageErrors.NON_EXISTENT}`
            );
        }

        certificationRequest.revoked = true;

        return this.repository.save(certificationRequest);
    }

    async get(id: number): Promise<CertificationRequest> {
        return this.repository.findOne(id, { relations: ['device'] });
    }

    async getAll(): Promise<CertificationRequest[]> {
        return this.repository.find({ relations: ['device'] });
    }
}
