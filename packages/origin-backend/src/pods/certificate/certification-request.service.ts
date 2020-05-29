import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, FindOneOptions, FindManyOptions } from 'typeorm';
import { ILoggedInUser, DeviceStatus } from '@energyweb/origin-backend-core';
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
        if (cert.device.status !== DeviceStatus.Active) {
            throw new UnprocessableEntityException({
                success: false,
                error: `Cannot create certification requests for device with status: ${
                    DeviceStatus[cert.device.status]
                }. Should be ${DeviceStatus[DeviceStatus.Active]}.`
            });
        }

        const certificationRequest = this.repository.create(cert);

        return this.repository.save(certificationRequest);
    }

    async update(
        id: number,
        data: CertificationRequestUpdateDTO,
        loggedUser: ILoggedInUser
    ): Promise<CertificationRequest> {
        const certificationRequest = await this.repository.findOne(id, {
            relations: ['device'],
            where: { userId: loggedUser.ownerId }
        });

        if (!certificationRequest) {
            throw new NotFoundException(
                `updateCertificationRequest(): ${StorageErrors.NON_EXISTENT}`
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

    async get(
        id: number,
        options?: FindOneOptions<CertificationRequest>
    ): Promise<CertificationRequest> {
        return this.repository.findOne(id, { ...options, relations: ['device'] });
    }

    async getAll(options?: FindManyOptions<CertificationRequest>): Promise<CertificationRequest[]> {
        return this.repository.find({ ...options, relations: ['device'] });
    }
}
