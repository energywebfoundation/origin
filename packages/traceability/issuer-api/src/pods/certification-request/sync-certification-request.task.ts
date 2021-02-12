import { Injectable, Logger } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificationRequest as CertificationRequestOnChain } from '@energyweb/issuer';
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

        const blockchainProperties = await this.blockchainPropertiesService.get();

        unapprovedCertRequests.forEach(async (certReq) => {
            const onchain = await new CertificationRequestOnChain(
                certReq.requestId,
                blockchainProperties.wrap()
            ).sync();

            if (onchain.approved) {
                this.logger.warn(
                    `Certification Request ${certReq.id} is unapproved but should be approved. Fixing...`
                );
                await this.commandBus.execute(new ApproveCertificationRequestCommand(certReq.id));
                this.logger.warn(`Certification Request ${certReq.id} is now set to approved`);
            }
        });
    }
}
