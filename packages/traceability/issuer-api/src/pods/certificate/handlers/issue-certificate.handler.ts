import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    Certificate as CertificateFacade,
    IOwnershipCommitmentProofWithTx
} from '@energyweb/issuer';
import { BigNumber } from 'ethers';
import { IssueCertificateCommand } from '../commands/issue-certificate.command';
import { Certificate } from '../certificate.entity';
import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';
import { CertificateDTO } from '../certificate.dto';
import { certificateToDto } from '../utils';
import { CertificatePersistedEvent } from '../events/certificate-persisted.event';

@CommandHandler(IssueCertificateCommand)
export class IssueCertificateHandler implements ICommandHandler<IssueCertificateCommand> {
    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>,
        private readonly blockchainPropertiesService: BlockchainPropertiesService,
        private readonly eventBus: EventBus
    ) {}

    async execute({
        to,
        energy,
        fromTime,
        toTime,
        deviceId,
        isPrivate,
        userId,
        metadata
    }: IssueCertificateCommand): Promise<CertificateDTO> {
        const blockchainProperties = await this.blockchainPropertiesService.get();

        let cert: CertificateFacade;
        let commitment: IOwnershipCommitmentProofWithTx;

        if (!isPrivate) {
            cert = await CertificateFacade.create(
                to,
                BigNumber.from(energy),
                fromTime,
                toTime,
                deviceId,
                blockchainProperties.wrap(),
                metadata
            );
        } else {
            ({ certificate: cert, proof: commitment } = await CertificateFacade.createPrivate(
                to,
                BigNumber.from(energy),
                fromTime,
                toTime,
                deviceId,
                blockchainProperties.wrap(),
                metadata
            ));
        }

        const certificate = this.repository.create({
            blockchain: blockchainProperties,
            tokenId: cert.id,
            deviceId: cert.deviceId,
            generationStartTime: cert.generationStartTime,
            generationEndTime: cert.generationEndTime,
            creationTime: cert.creationTime,
            metadata: cert.metadata,
            creationBlockHash: cert.creationBlockHash,
            owners: cert.owners,
            issuedPrivately: isPrivate ?? false,
            latestCommitment: isPrivate ? commitment : null
        });
        const savedCertificate = await this.repository.save(certificate);

        this.eventBus.publish(new CertificatePersistedEvent(certificate.id));

        return certificateToDto(savedCertificate, userId);
    }
}
