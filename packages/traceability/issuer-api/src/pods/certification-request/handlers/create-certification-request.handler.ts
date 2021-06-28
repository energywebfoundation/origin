import { CertificationRequest as CertificationRequestFacade } from '@energyweb/issuer';
import { BadRequestException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isAddress, getAddress } from 'ethers/lib/utils';

import { BlockchainPropertiesService } from '../../blockchain';
import { CertificationRequestDTO } from '../certification-request.dto';
import { CertificationRequest } from '../certification-request.entity';
import { CreateCertificationRequestCommand } from '../commands';

@CommandHandler(CreateCertificationRequestCommand)
export class CreateCertificationRequestHandler
    implements ICommandHandler<CreateCertificationRequestCommand>
{
    readonly logger = new Logger(CreateCertificationRequestHandler.name);

    constructor(
        @InjectRepository(CertificationRequest)
        readonly repository: Repository<CertificationRequest>,
        readonly blockchainPropertiesService: BlockchainPropertiesService
    ) {}

    async execute({
        fromTime,
        toTime,
        deviceId,
        to,
        energy,
        files,
        isPrivate
    }: CreateCertificationRequestCommand): Promise<CertificationRequestDTO> {
        if (!isAddress(to)) {
            throw new BadRequestException(
                'Invalid "to" parameter, it has to be ethereum address string'
            );
        }

        const blockchainProperties = await this.blockchainPropertiesService.get();

        try {
            const certReq = await CertificationRequestFacade.create(
                fromTime,
                toTime,
                deviceId,
                blockchainProperties.wrap(),
                to
            );
            this.logger.debug(
                `Certification request ${certReq.id} has been deployed with id ${certReq.id} `
            );

            const certificationRequest = this.repository.create({
                id: certReq.id,
                deviceId,
                energy,
                fromTime,
                toTime,
                approved: false,
                revoked: false,
                files,
                isPrivate: isPrivate ?? false,
                owner: getAddress(to)
            });

            return this.repository.save(certificationRequest);
        } catch (e) {
            this.logger.error(
                `Certification request creation has failed with the error: ${e.message}`
            );
        }
    }
}
