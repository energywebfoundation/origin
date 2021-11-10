import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { GetAllCertificatesQuery } from '../queries/get-all-certificates.query';
import { Certificate } from '../certificate.entity';

const dateToSeconds = (d: Date) => Math.floor(d.getTime() / 1000);
@QueryHandler(GetAllCertificatesQuery)
export class GetAllCertificatesHandler implements IQueryHandler<GetAllCertificatesQuery> {
    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>
    ) {}

    async execute({ options }: GetAllCertificatesQuery): Promise<Certificate[]> {
        const generationEndFrom = dateToSeconds(options.generationEndFrom ?? new Date(0));
        const generationEndTo = dateToSeconds(options.generationEndTo ?? new Date());
        const generationStartFrom = dateToSeconds(options.generationStartFrom ?? new Date(0));
        const generationStartTo = dateToSeconds(options.generationStartTo ?? new Date());
        const creationTimeFrom = dateToSeconds(options.creationTimeFrom ?? new Date(0));
        const creationTimeTo = dateToSeconds(options.creationTimeTo ?? new Date());

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
