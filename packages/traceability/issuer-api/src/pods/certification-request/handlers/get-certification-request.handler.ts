import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificationRequest } from '../certification-request.entity';
import { GetCertificationRequestQuery } from '../queries';
import { CertificationRequestDTO } from '../certification-request.dto';

@QueryHandler(GetCertificationRequestQuery)
export class GetCertificationRequestHandler implements IQueryHandler<GetCertificationRequestQuery> {
    constructor(
        @InjectRepository(CertificationRequest)
        readonly repository: Repository<CertificationRequest>
    ) {}

    async execute({ id }: GetCertificationRequestQuery): Promise<CertificationRequestDTO> {
        return this.repository.findOne(id);
    }
}
