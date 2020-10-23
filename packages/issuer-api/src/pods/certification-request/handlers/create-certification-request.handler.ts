import * as Moment from 'moment';
import { extendMoment } from 'moment-range';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificationRequest as CertificationRequestFacade } from '@energyweb/issuer';
import { ISuccessResponse } from '@energyweb/origin-backend-core';
import { ConflictException } from '@nestjs/common';
import { CreateCertificationRequestCommand } from '../commands/create-certification-request.command';
import { CertificationRequest } from '../certification-request.entity';
import { BlockchainPropertiesService } from '../../blockchain/blockchain-properties.service';

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
    }: CreateCertificationRequestCommand): Promise<CertificationRequest> {
        await this.validateGenerationPeriod(fromTime, toTime, deviceId);

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

    async validateGenerationPeriod(
        fromTime: number,
        toTime: number,
        deviceId: string
    ): Promise<ISuccessResponse> {
        const moment = extendMoment(Moment);
        const unix = (timestamp: number) => moment.unix(timestamp);

        const deviceCertificationRequests = await this.repository.find({
            where: {
                revoked: false,
                deviceId
            }
        });

        const generationTimeRange = moment.range(unix(fromTime), unix(toTime));

        for (const certificationRequest of deviceCertificationRequests) {
            const certificationRequestGenerationRange = moment.range(
                unix(certificationRequest.fromTime),
                unix(certificationRequest.toTime)
            );

            if (generationTimeRange.overlaps(certificationRequestGenerationRange)) {
                throw new ConflictException({
                    success: false,
                    message: `Wanted generation time clashes with an existing certification request: ${certificationRequest.id}`
                });
            }
        }

        return { success: true, message: 'The generation period is valid.' };
    }
}
