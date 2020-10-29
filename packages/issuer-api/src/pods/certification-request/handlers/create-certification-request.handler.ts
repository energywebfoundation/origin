import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificationRequest as CertificationRequestFacade } from '@energyweb/issuer';
import { CreateCertificationRequestCommand } from '../commands/create-certification-request.command';
import { CertificationRequest } from '../certification-request.entity';
import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';
import { CertificationRequestDTO } from '../certification-request.dto';

@CommandHandler(CreateCertificationRequestCommand)
export class CreateCertificationRequestHandler
    implements ICommandHandler<CreateCertificationRequestCommand> {
    constructor(
        @InjectRepository(CertificationRequest)
        private readonly repository: Repository<CertificationRequest>,
        private readonly blockchainPropertiesService: BlockchainPropertiesService
    ) {}

    async execute({
        to,
        energy,
        fromTime,
        toTime,
        deviceId,
        files,
        isPrivate
    }: CreateCertificationRequestCommand): Promise<CertificationRequestDTO> {
        const blockchainProperties = await this.blockchainPropertiesService.get();

        const certReq = await CertificationRequestFacade.create(
            fromTime,
            toTime,
            deviceId,
            blockchainProperties.wrap(),
            to
        );

        const certificationRequest = this.repository.create({
            requestId: certReq.id,
            deviceId: certReq.deviceId,
            energy,
            owner: certReq.owner,
            fromTime: certReq.fromTime,
            toTime: certReq.toTime,
            created: certReq.created,
            approved: certReq.approved,
            revoked: certReq.revoked,
            files,
            isPrivate: isPrivate ?? false
        });

        return this.repository.save(certificationRequest);
    }
}
