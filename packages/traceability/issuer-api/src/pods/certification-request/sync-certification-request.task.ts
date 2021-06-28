import { Injectable, Logger } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockchainPropertiesService } from '../blockchain/blockchain-properties.service';
import { Certificate } from '../certificate/certificate.entity';
import { CertificateCreatedEvent } from '../certificate/events/certificate-created-event';
import { CertificationRequest } from './certification-request.entity';
import { ApproveCertificationRequestCommand } from './commands/approve-certification-request.command';

@Injectable()
export class SyncCertificationRequestsTask {
    private readonly logger = new Logger(SyncCertificationRequestsTask.name);

    constructor(
        @InjectRepository(CertificationRequest)
        private readonly repository: Repository<CertificationRequest>,
        @InjectRepository(Certificate)
        private readonly certificateRepository: Repository<Certificate>,
        private readonly blockchainPropertiesService: BlockchainPropertiesService,
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async syncCertificates(): Promise<void> {
        await this.validateApproved();

        const approvedCertRequests = await this.repository.find({
            where: {
                approved: true
            }
        });

        for (const certReq of approvedCertRequests) {
            const certificate = await this.certificateRepository.findOne({
                where: { id: certReq.issuedCertificateId }
            });

            if (!certificate?.id && certificate?.id !== 0) {
                this.logger.debug(
                    `Certification request #${certReq.id} has a certificate ${certReq.issuedCertificateId} assigned but this certificate doesn't exist in the database.`
                );
                this.logger.debug(
                    `Emitting CertificateCreatedEvent for certificate with id ${certificate.id}...`
                );

                this.eventBus.publish(
                    new CertificateCreatedEvent(
                        certificate.id,
                        certificate.issuedPrivately
                            ? { owner: certReq.owner, energy: certReq.energy }
                            : null
                    )
                );
            }
        }
    }

    /**
     * Checks if a certificate marked as not approved is actually
     * approved on-chain.
     */
    async validateApproved(): Promise<void> {
        const unapprovedCertRequests = await this.repository.find({
            where: {
                approved: false
            }
        });

        unapprovedCertRequests.forEach(async (certReq) => {
            if (certReq.approved) {
                this.logger.warn(
                    `Certification Request ${certReq.id} is unapproved but should be approved. Fixing...`
                );
                await this.commandBus.execute(new ApproveCertificationRequestCommand(certReq.id));
                this.logger.warn(`Certification Request ${certReq.id} is now set to approved`);
            }
        });
    }
}
