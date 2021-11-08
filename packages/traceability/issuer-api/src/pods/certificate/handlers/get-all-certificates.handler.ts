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

    async execute(event: GetAllCertificatesQuery): Promise<Certificate[]> {
        const generationEndFrom = dateToSeconds(event.options.generationEndFrom ?? new Date(0));
        const generationEndTo = dateToSeconds(event.options.generationEndTo ?? new Date());

        return this.repository.find({
            where: {
                generationEndTime: Between(generationEndFrom, generationEndTo)
            },
            order: {
                id: 'ASC'
            }
        });
    }
}
