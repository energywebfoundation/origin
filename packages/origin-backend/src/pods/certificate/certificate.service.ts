import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, FindManyOptions, BaseEntity, DeepPartial } from 'typeorm';
import {
    ICertificationRequestWithRelationsIds,
    ICertificationRequest,
    CertificationRequestStatus,
    ICertificationRequestProperties
} from '@energyweb/origin-backend-core';
import { CertificationRequest } from './certification-request.entity';
import { DeviceService } from '../device/device.service';

@Injectable()
export class CertificateService {
    constructor(
        @InjectRepository(CertificationRequest)
        private readonly certificationRequestRepository: Repository<CertificationRequest>,
        private readonly deviceService: DeviceService
    ) {}

    async findOneCertificationRequest(
        id: string,
        options: FindOneOptions<CertificationRequest> = {}
    ) {
        const result = await this.certificationRequestRepository.findOne(id, {
            loadRelationIds: true,
            ...options
        });

        if (typeof result.device === 'object') {
            (result as any).device = result.device.id;
        }

        return (result as Omit<
            ICertificationRequest,
            'device'
        >) as ICertificationRequestWithRelationsIds & BaseEntity;
    }

    async findCertificationRequest(options: FindManyOptions<CertificationRequest> = {}) {
        return ((
            await this.certificationRequestRepository.find({
                loadRelationIds: true,
                ...options
            })
        ).map(e => {
            if (typeof e.device === 'object') {
                (e as any).device = e.device.id;
            }

            return e;
        }) as Omit<ICertificationRequest, 'device'>[]) as (ICertificationRequestWithRelationsIds &
            BaseEntity)[];
    }

    async approveCertificationRequest(id: string) {
        const entity = await this.findOneCertificationRequest(id);

        if (entity.status !== CertificationRequestStatus.Pending) {
            throw new Error(`Can't approve certification request in status other than pending.`);
        }

        entity.status = CertificationRequestStatus.Approved;

        await entity.save();

        return this.findOneCertificationRequest(entity.id);
    }

    async create(entityLike: DeepPartial<ICertificationRequestProperties>, deviceId: string) {
        const device = await this.deviceService.findOne(deviceId);

        if (!device) {
            throw new Error(
                `Can't create a certification request for non-existing device with id: ${deviceId}`
            );
        }

        return this.certificationRequestRepository.create({ ...entityLike, device });
    }
}
