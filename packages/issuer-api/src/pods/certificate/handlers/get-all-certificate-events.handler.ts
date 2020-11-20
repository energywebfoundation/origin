import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificateUtils } from '@energyweb/issuer';
import { GetAllCertificateEventsQuery } from '../queries/get-all-certificate-events.query';
import { Certificate } from '../certificate.entity';
import { CertificateEvent } from '../../../types';
import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';

@QueryHandler(GetAllCertificateEventsQuery)
export class GetAllCertificateEventsHandler implements IQueryHandler<GetAllCertificateEventsQuery> {
    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>,
        private readonly blockchainPropertiesService: BlockchainPropertiesService
    ) {}

    async execute({ id }: GetAllCertificateEventsQuery): Promise<CertificateEvent[]> {
        const certificate = await this.repository.findOne(id);

        if (!certificate) {
            return [];
        }

        const blockchainProperties = await this.blockchainPropertiesService.get();

        const allCertificateEvents = await CertificateUtils.getAllCertificateEvents(
            certificate.tokenId,
            blockchainProperties.wrap()
        );

        return allCertificateEvents.map((blockchainEvent) => ({
            name: blockchainEvent.name,
            timestamp: blockchainEvent.timestamp,
            ...blockchainEvent
        }));
    }
}
