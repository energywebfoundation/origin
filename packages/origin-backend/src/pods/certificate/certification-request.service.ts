import {
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
    UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, FindOneOptions, FindManyOptions } from 'typeorm';
import { ILoggedInUser, DeviceStatus } from '@energyweb/origin-backend-core';
import { CertificationRequest } from './certification-request.entity';
import { CertificationRequestQueueItemDTO } from './certification-request-queue-item.dto';
import { StorageErrors } from '../../enums/StorageErrors';
import { CertificationRequestQueueItem } from './certification-request-queue-item.entity';
import { DeviceService } from '../device/device.service';

@Injectable()
export class CertificationRequestService {
    constructor(
        @InjectRepository(CertificationRequest)
        private readonly repository: Repository<CertificationRequest>,
        @InjectRepository(CertificationRequestQueueItem)
        private readonly queueRepository: Repository<CertificationRequestQueueItem>,
        private readonly deviceService: DeviceService
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

        const queuedData = await this.queueRepository.findOne({
            deviceId: cert.device.issuerId.id,
            fromTime: cert.fromTime,
            toTime: cert.toTime
        });

        if (!queuedData) {
            throw new NotFoundException(
                `CertificationRequestService.create(): Unable to find queued data for certification request ${cert.id}`
            );
        }

        const certificationRequest = this.repository.create({
            ...cert,
            energy: queuedData.energy,
            files: queuedData.files
        });

        await this.repository.save(certificationRequest);
        await this.queueRepository.remove(queuedData);

        return certificationRequest;
    }

    async queue(
        dto: CertificationRequestQueueItemDTO,
        loggedUser: ILoggedInUser
    ): Promise<CertificationRequestQueueItem> {
        const device = await this.deviceService.findByExternalId({
            id: dto.deviceId,
            type: process.env.ISSUER_ID
        });

        if (device.organization !== loggedUser.organizationId) {
            throw new UnauthorizedException('You are not the device manager.');
        }

        return this.queueRepository.save(dto);
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
