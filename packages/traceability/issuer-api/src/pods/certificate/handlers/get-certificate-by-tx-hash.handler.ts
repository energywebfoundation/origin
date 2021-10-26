import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '../certificate.entity';
import { GetCertificateByTxHashQuery } from '../queries';

@QueryHandler(GetCertificateByTxHashQuery)
export class GetCertificateByTxHashHandler implements IQueryHandler<GetCertificateByTxHashQuery> {
    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>
    ) {}

    async execute({ txHash }: GetCertificateByTxHashQuery): Promise<Certificate[]> {
        return this.repository.find({
            where: {
                creationTransactionHash: txHash.toLowerCase()
            },
            order: {
                id: 'ASC'
            }
        });
    }
}
