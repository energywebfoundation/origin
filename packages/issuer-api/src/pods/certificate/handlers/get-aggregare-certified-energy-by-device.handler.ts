import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { BigNumber, constants } from 'ethers';
import { GetAggregateCertifiedEnergyByDeviceIdQuery } from '../queries/get-aggregate-certified-energy-by-device.query';
import { Certificate } from '../certificate.entity';
import { certificateToDto } from '../utils';

@QueryHandler(GetAggregateCertifiedEnergyByDeviceIdQuery)
export class GetAggregateCertifiedEnergyDeviceIdHandler
    implements IQueryHandler<GetAggregateCertifiedEnergyByDeviceIdQuery> {
    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>
    ) {}

    async execute({
        userId,
        deviceId,
        startDate,
        endDate
    }: GetAggregateCertifiedEnergyByDeviceIdQuery): Promise<string> {
        const certificates = await this.repository.find({
            where: {
                deviceId,
                generationStartTime: MoreThanOrEqual(startDate),
                generationEndTime: LessThanOrEqual(endDate)
            }
        });

        if (!certificates) {
            return '0';
        }

        const energies = Promise.all(
            certificates.map((certificate) => certificateToDto(certificate, userId))
        );

        return `${(await energies).reduce(
            (a, b) =>
                BigNumber.from(a).add(
                    BigNumber.from(b.energy.publicVolume) || BigNumber.from(constants.Zero)
                ),
            BigNumber.from(constants.Zero)
        )}`;
    }
}
