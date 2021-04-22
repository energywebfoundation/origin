import { CertificationRequest as CertificationRequestFacade } from '@energyweb/issuer';
import { BadRequestException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { Repository } from 'typeorm';
import { isAddress, getAddress } from 'ethers/lib/utils';

import {
    BlockchainPropertiesService,
    CertificationRequestStatus,
    CertificationRequestDTO,
    CertificationRequest
} from '@energyweb/issuer-api';
import { CreateIrecCertificationRequestCommand } from '../commands/create-irec-certification-request.command';

@CommandHandler(CreateIrecCertificationRequestCommand)
export class CreateCertificationRequestHandler
    implements ICommandHandler<CreateIrecCertificationRequestCommand> {
    private readonly logger = new Logger(CreateCertificationRequestHandler.name);

    private readonly requestQueue = new Subject<number>();

    constructor(
        @InjectRepository(CertificationRequest)
        private readonly repository: Repository<CertificationRequest>,
        private readonly blockchainPropertiesService: BlockchainPropertiesService
    ) {
        this.requestQueue.pipe(concatMap((id) => this.process(id))).subscribe();
    }

    async execute({
        user,
        to,
        energy,
        fromTime,
        toTime,
        deviceId,
        files,
        isPrivate
    }: CreateIrecCertificationRequestCommand): Promise<CertificationRequestDTO> {
        if (!isAddress(to)) {
            throw new BadRequestException(
                'Invalid "to" parameter, it has to be ethereum address string'
            );
        }

        const certificationRequest = this.repository.create({
            deviceId,
            energy,
            fromTime,
            toTime,
            approved: false,
            revoked: false,
            files,
            isPrivate: isPrivate ?? false,
            status: CertificationRequestStatus.Queued,
            owner: getAddress(to) // it returns checksum address
        });

        const stored = await this.repository.save(certificationRequest);

        this.requestQueue.next(stored.id);

        return stored;
    }

    private async process(requestId: number) {
        this.logger.debug(`Processing certification request ${requestId}`);

        const request = await this.repository.findOne(requestId);

        if (!request) {
            this.logger.error(
                `Certification request ${requestId} not longer exists in DB...skipping`
            );
            return;
        }

        if (request.status !== CertificationRequestStatus.Queued) {
            this.logger.error(
                `Certification request ${requestId} was expected to have status ${CertificationRequestStatus.Queued} but has ${request.status}`
            );
            return;
        }

        const blockchainProperties = await this.blockchainPropertiesService.get();

        const { fromTime, toTime, deviceId, owner } = request;

        try {
            const { created, id } = await CertificationRequestFacade.create(
                fromTime,
                toTime,
                deviceId,
                blockchainProperties.wrap(),
                owner
            );
            this.logger.debug(
                `Certification request ${requestId} has been deployed with id ${id} `
            );

            await this.repository.update(request.id, {
                created,
                requestId: id,
                status: CertificationRequestStatus.Executed
            });
        } catch (e) {
            this.logger.error(
                `Certification request ${requestId} deployment has failed with the error: ${e.message}`
            );

            await this.repository.update(request.id, {
                status: CertificationRequestStatus.Error
            });
        }
    }
}
