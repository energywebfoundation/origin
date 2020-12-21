import { CertificationRequest as CertificationRequestFacade } from '@energyweb/issuer';
import { BadRequestException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { Repository } from 'typeorm';

import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';
import { CertificationRequestStatus } from '../certification-request-status.enum';
import { CertificationRequestDTO } from '../certification-request.dto';
import { CertificationRequest } from '../certification-request.entity';
import { CreateCertificationRequestCommand } from '../commands/create-certification-request.command';

const eth = /^(0x)[0-9a-f]{40}$/i;

function isValidEthereumAddress(to: string) {
    return typeof to === 'string' && eth.test(to);
}

@CommandHandler(CreateCertificationRequestCommand)
export class CreateCertificationRequestHandler
    implements ICommandHandler<CreateCertificationRequestCommand> {
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
        to,
        energy,
        fromTime,
        toTime,
        deviceId,
        files,
        isPrivate
    }: CreateCertificationRequestCommand): Promise<CertificationRequestDTO> {
        if (!isValidEthereumAddress(to)) {
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
            owner: to
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
