import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { ISuccessResponse } from '@energyweb/origin-backend-core';

import { SyncCertificateEvent } from '../events/sync-certificate-event';
import { Certificate } from '../certificate.entity';

@EventsHandler(SyncCertificateEvent)
export class SyncCertificateHandler implements IEventHandler<SyncCertificateEvent> {
    private readonly logger = new Logger(SyncCertificateHandler.name);

    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>
    ) {}

    async handle({ tokenId }: SyncCertificateEvent): Promise<ISuccessResponse> {
        this.logger.log(`Detected a new certificate event for certificate ${tokenId}`);

        const certificate = await this.repository.findOne(
            { tokenId },
            { relations: ['blockchain'] }
        );
        await certificate.sync();

        return {
            success: true
        };
    }
}
