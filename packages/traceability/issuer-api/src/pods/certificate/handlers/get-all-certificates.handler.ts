import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { GetAllCertificatesQuery } from '../queries/get-all-certificates.query';
import { Certificate } from '../certificate.entity';

const dateToSeconds = (d: Date) => Math.floor(d.getTime() / 1000);
const futureDate = new Date('2038-01-01T00:00:00.000Z'); // used for more elegant query, this is almost max date, that can be converted to postgres int4

@QueryHandler(GetAllCertificatesQuery)
export class GetAllCertificatesHandler implements IQueryHandler<GetAllCertificatesQuery> {
    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>
    ) {}

    async execute({ options }: GetAllCertificatesQuery): Promise<Certificate[]> {
        const generationEndFrom = dateToSeconds(options.generationEndFrom ?? new Date(0));
        const generationEndTo = dateToSeconds(options.generationEndTo ?? futureDate);
        const generationStartFrom = dateToSeconds(options.generationStartFrom ?? new Date(0));
        const generationStartTo = dateToSeconds(options.generationStartTo ?? futureDate);
        const creationTimeFrom = dateToSeconds(options.creationTimeFrom ?? new Date(0));
        const creationTimeTo = dateToSeconds(options.creationTimeTo ?? futureDate);

        return this.repository.find({
            where: {
                generationEndTime: Between(generationEndFrom, generationEndTo),
                generationStartTime: Between(generationStartFrom, generationStartTo),
                creationTime: Between(creationTimeFrom, creationTimeTo),
                ...(options.deviceId ? { deviceId: options.deviceId } : {})
            },
            order: {
                id: 'ASC'
            }
        });
    }
}
