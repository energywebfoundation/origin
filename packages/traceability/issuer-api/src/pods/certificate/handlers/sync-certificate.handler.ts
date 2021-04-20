import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ISuccessResponse, ResponseFailure, ResponseSuccess } from '@energyweb/origin-backend-core';

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
        this.logger.log(
            `Detected a new event for certificate with tokenId ${tokenId}. Re-syncing...`
        );

        const certificate = await this.repository.findOne(
            { tokenId },
            { relations: ['blockchain'] }
        );

        try {
            const response = await certificate.sync();

            if (!response.success) {
                throw new HttpException(response.message, response.statusCode);
            }
        } catch (e) {
            this.logger.error(
                `Failed to resync certificate ${tokenId}: ${JSON.stringify(e.message)}`
            );
            this.logger.error(JSON.stringify(e));
            return ResponseFailure(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        this.logger.log(`Successfully re-synced certificate with tokenId ${tokenId}.`);
        return ResponseSuccess();
    }
}
