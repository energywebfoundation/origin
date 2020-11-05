import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificationRequest as CertificationRequestFacade } from '@energyweb/issuer';
import { ISuccessResponse, ResponseFailure, ResponseSuccess } from '@energyweb/origin-backend-core';

import { RevokeCertificationRequestCommand } from '../commands/revoke-certification-request.command';
import { CertificationRequest } from '../certification-request.entity';
import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';

@CommandHandler(RevokeCertificationRequestCommand)
export class RevokeCertificationRequestHandler
    implements ICommandHandler<RevokeCertificationRequestCommand> {
    constructor(
        @InjectRepository(CertificationRequest)
        private readonly repository: Repository<CertificationRequest>,
        private readonly blockchainPropertiesService: BlockchainPropertiesService
    ) {}

    async execute({ id }: RevokeCertificationRequestCommand): Promise<ISuccessResponse> {
        const certificationRequest = await this.repository.findOne(id);

        if (certificationRequest.revoked || certificationRequest.approved) {
            return ResponseFailure(
                `Certificate #${id} can't be revoked. It has already been revoked or approved.`
            );
        }

        const blockchainProperties = await this.blockchainPropertiesService.get();

        const certReq = await new CertificationRequestFacade(
            certificationRequest.requestId,
            blockchainProperties.wrap()
        ).sync();

        try {
            await certReq.revoke();
        } catch (e) {
            return ResponseFailure(e.message);
        }

        await this.repository.update(id, {
            revoked: true,
            revokedDate: new Date()
        });

        return ResponseSuccess(`Successfully revoked certificationRequest ${id}.`);
    }
}
