import { CertificationRequest as CertificationRequestFacade } from '@energyweb/issuer';
import { BadRequestException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { Repository } from 'typeorm';
import { isAddress, getAddress } from 'ethers/lib/utils';

import { BlockchainPropertiesService } from '../../blockchain';
import { CertificationRequestStatus } from '../certification-request-status.enum';
import { CertificationRequestDTO } from '../certification-request.dto';
import { CertificationRequest } from '../certification-request.entity';
import { CreateCertificationRequestCommand } from '../commands';

@CommandHandler(CreateCertificationRequestCommand)
export class CreateCertificationRequestHandler
    implements ICommandHandler<CreateCertificationRequestCommand>
{
    readonly logger = new Logger(CreateCertificationRequestHandler.name);

    private readonly requestQueue = new Subject<number>();

    constructor(
        @InjectRepository(CertificationRequest)
        readonly repository: Repository<CertificationRequest>,
        readonly blockchainPropertiesService: BlockchainPropertiesService
    ) {
        this.requestQueue.pipe(concatMap((id) => this.process(id))).subscribe();
    }

    async execute(params: CreateCertificationRequestCommand): Promise<CertificationRequestDTO> {
        const stored = await this.createCertificationRequest(params);

        this.addToQueue(stored.id);

        return stored;
    }

    async createCertificationRequest({
        to,
        energy,
        fromTime,
        toTime,
        deviceId,
        files,
        isPrivate
    }: CreateCertificationRequestCommand): Promise<CertificationRequestDTO> {
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

        return this.repository.save(certificationRequest);
    }

    addToQueue(id: number) {
        this.requestQueue.next(id);
    }

    async process(requestId: number) {
        const request: CertificationRequest = await this.getCertificationRequest(requestId);

        if (request) {
            await this.mintCertificationRequest(request);
        }
    }

    async getCertificationRequest(requestId: number): Promise<CertificationRequest> {
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

        return request;
    }

    async mintCertificationRequest(request: CertificationRequest): Promise<void> {
        const { id, fromTime, toTime, deviceId, owner } = request;
        const blockchainProperties = await this.blockchainPropertiesService.get();
        try {
            const { created, id } = await CertificationRequestFacade.create(
                fromTime,
                toTime,
                deviceId,
                blockchainProperties.wrap(),
                owner
            );
            this.logger.debug(`Certification request ${id} has been deployed with id ${id} `);

            await this.repository.update(request.id, {
                created,
                requestId: id,
                status: CertificationRequestStatus.Executed
            });
        } catch (e) {
            this.logger.error(
                `Certification request ${id} deployment has failed with the error: ${e.message}`
            );

            await this.repository.update(request.id, {
                status: CertificationRequestStatus.Error
            });
        }
    }
}
