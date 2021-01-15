import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '../certificate.entity';
import { GetAggregateCertifiedEnergyByDeviceIdQuery } from '../queries/get-aggregate-certified-energy-by-device.query';
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
        deviceId
    }: GetAggregateCertifiedEnergyByDeviceIdQuery): Promise<string> {
        const certificate = await this.repository.findOne({ deviceId });

        return certificateToDto(certificate, userId);
    }
}
