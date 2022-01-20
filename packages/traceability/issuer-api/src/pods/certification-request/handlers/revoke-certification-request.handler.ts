import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificationRequest as CertificationRequestFacade } from '@energyweb/issuer';
import { ISuccessResponse, ResponseFailure, ResponseSuccess } from '@energyweb/origin-backend-core';
import { HttpStatus, Logger } from '@nestjs/common';

import { RevokeCertificationRequestCommand } from '../commands/revoke-certification-request.command';
import { CertificationRequest } from '../certification-request.entity';
import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';

@CommandHandler(RevokeCertificationRequestCommand)
export class RevokeCertificationRequestHandler
    implements ICommandHandler<RevokeCertificationRequestCommand>
{
    private readonly logger = new Logger(RevokeCertificationRequestHandler.name);

    constructor(
        @InjectRepository(CertificationRequest)
        private readonly repository: Repository<CertificationRequest>,
        private readonly blockchainPropertiesService: BlockchainPropertiesService
    ) {}

    async execute({ id }: RevokeCertificationRequestCommand): Promise<ISuccessResponse> {
        const { revoked, approved } = await this.repository.findOne(id);

        if (revoked || approved) {
            const msg = `Certificate #${id} is still pending execution`;
            this.logger.debug(msg);
            return ResponseFailure(msg, HttpStatus.BAD_REQUEST);
        }

        const blockchainProperties = await this.blockchainPropertiesService.getWrapped();

        const certReq = await new CertificationRequestFacade(id, blockchainProperties).sync();

        try {
            await certReq.revoke();
        } catch (e) {
            return ResponseFailure(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        await this.repository.update(id, {
            revoked: true,
            revokedDate: new Date()
        });

        return ResponseSuccess(`Successfully revoked certificationRequest ${id}.`);
    }
}
