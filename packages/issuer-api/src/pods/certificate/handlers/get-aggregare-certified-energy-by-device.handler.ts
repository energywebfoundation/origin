import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { IssueCertificateDTO } from '../commands/issue-certificate.dto';
import { GetAggregateCertifiedEnergyByDeviceIdQuery } from '../queries/get-aggregate-certified-energy-by-device.query';

@QueryHandler(GetAggregateCertifiedEnergyByDeviceIdQuery)
export class GetAggregateCertifiedEnergyDeviceIdHandler
    implements IQueryHandler<GetAggregateCertifiedEnergyByDeviceIdQuery> {
    constructor(
        @InjectRepository(IssueCertificateDTO)
        private readonly repository: Repository<IssueCertificateDTO>
    ) {}

    async execute({
        deviceId,
        startDate,
        endDate
    }: GetAggregateCertifiedEnergyByDeviceIdQuery): Promise<string> {
        const energies = await this.repository.find({
            deviceId,
            fromTime: MoreThanOrEqual(startDate),
            toTime: LessThanOrEqual(endDate)
        });

        if (!energies) {
            return '0';
        }

        return `${energies.reduce((a, b) => a + (parseInt(b.energy, 10) || 0), 0)}`;
    }
}
