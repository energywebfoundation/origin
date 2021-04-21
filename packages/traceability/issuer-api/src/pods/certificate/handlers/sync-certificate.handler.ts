import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ISuccessResponse, ResponseFailure, ResponseSuccess } from '@energyweb/origin-backend-core';
import { Certificate as OnChainCertificate } from '@energyweb/issuer';

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

        if (!certificate.blockchain || !certificate.tokenId) {
            throw new Error(
                `Certificate ${certificate.id} is missing either blockchain (${certificate.blockchain}) or tokenId (${certificate.tokenId}) properties.`
            );
        }

        const onChainCert = await new OnChainCertificate(
            certificate.tokenId,
            certificate.blockchain.wrap()
        ).sync();

        try {
            const updateResult = await this.repository.update(certificate.id, {
                owners: onChainCert.owners,
                claimers: onChainCert.claimers,
                claims: await onChainCert.getClaimedData()
            });

            if (updateResult.affected < 1) {
                throw new HttpException(
                    `Unable to perform update on certificate ${certificate.id}: ${updateResult.raw}`,
                    500
                );
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
