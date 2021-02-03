import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { BigNumber, constants } from 'ethers';
import { GetAggregateCertifiedEnergyByDeviceIdQuery } from '../queries/get-aggregate-certified-energy-by-device.query';
import { Certificate } from '../certificate.entity';

@QueryHandler(GetAggregateCertifiedEnergyByDeviceIdQuery)
export class GetAggregateCertifiedEnergyDeviceIdHandler
    implements IQueryHandler<GetAggregateCertifiedEnergyByDeviceIdQuery> {
    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>
    ) {}

    async execute({
        deviceId,
        startDate,
        endDate
    }: GetAggregateCertifiedEnergyByDeviceIdQuery): Promise<BigNumber> {
        const certificates = await this.repository.find({
            where: {
                deviceId,
                generationStartTime: MoreThanOrEqual(startDate),
                generationEndTime: LessThanOrEqual(endDate)
            }
        });

        if (!certificates) {
            return BigNumber.from(constants.Zero);
        }

        return certificates
            .flatMap((c) => Object.values(c.owners))
            .reduce(
                (a, b) => BigNumber.from(a).add(BigNumber.from(b)),
                BigNumber.from(constants.Zero)
            );
    }
}
