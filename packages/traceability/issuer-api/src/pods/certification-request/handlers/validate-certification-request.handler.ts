import * as Moment from 'moment';
import { extendMoment } from 'moment-range';
import { Repository } from 'typeorm';
import { isAddress } from 'ethers/lib/utils';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { ISuccessResponse, ResponseFailure, ResponseSuccess } from '@energyweb/origin-backend-core';

import { ValidateCertificationRequestCommand } from '../commands';
import { CertificationRequest } from '../certification-request.entity';

@CommandHandler(ValidateCertificationRequestCommand)
export class ValidateCertificationRequestHandler
    implements ICommandHandler<ValidateCertificationRequestCommand>
{
    constructor(
        @InjectRepository(CertificationRequest)
        private readonly repository: Repository<CertificationRequest>
    ) {}

    async execute({
        dto: { to, fromTime, toTime, deviceId }
    }: ValidateCertificationRequestCommand): Promise<ISuccessResponse> {
        const moment = extendMoment(Moment);
        const unix = (timestamp: number) => moment.unix(timestamp);

        if (to && !isAddress(to)) {
            throw new BadRequestException('Invalid recipient address');
        }

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
                return ResponseFailure(
                    `Wanted generation time clashes with an existing certification request: ${certificationRequest.id}`,
                    HttpStatus.CONFLICT
                );
            }
        }

        return ResponseSuccess('The generation period is valid.');
    }
}
