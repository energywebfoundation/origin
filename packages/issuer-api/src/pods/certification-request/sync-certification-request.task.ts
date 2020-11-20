import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '../certificate/certificate.entity';
import { CertificateCreatedEvent } from '../certificate/events/certificate-created-event';
import { CertificationRequest } from './certification-request.entity';

@Injectable()
export class SyncCertificationRequestsTask {
    private readonly logger = new Logger(SyncCertificationRequestsTask.name);

    constructor(
        @InjectRepository(CertificationRequest)
        private readonly repository: Repository<CertificationRequest>,
        @InjectRepository(Certificate)
        private readonly certificateRepository: Repository<Certificate>,
        private readonly eventBus: EventBus
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async syncCertificates(): Promise<void> {
        this.logger.debug(
            `Checking if all certification requests have a corresponding certificate in the db...`
        );

        const approvedCertRequests = await this.repository.find({
            where: {
                approved: true
            }
        });

        for (const certReq of approvedCertRequests) {
            const certificate = await this.certificateRepository.findOne({
                where: {
                    tokenId: certReq.issuedCertificateTokenId
                }
            });

            if (!certificate?.tokenId && certificate?.tokenId !== 0) {
                this.logger.debug(
                    `Certification request #${certReq.id} has a certificate ${certReq.issuedCertificateTokenId} assigned but this certificate doesn't exist in the database.`
                );
                this.logger.debug(
                    `Emitting CertificateCreatedEvent for certificate with tokenId ${certificate.tokenId}...`
                );

                this.eventBus.publish(
                    new CertificateCreatedEvent(
                        certificate.tokenId,
                        certificate.issuedPrivately
                            ? { owner: certReq.owner, energy: certReq.energy }
                            : null
                    )
                );
            }
        }

        this.logger.debug(`Done checking certification requests.`);
    }
}
