import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICertificateDTO } from '../certificate.dto';
import { Certificate } from '../certificate.entity';
import { GetCertificateByTokenIdQuery } from '../queries/get-certificate-by-token.query';
import { certificateToDto } from '../utils';

@QueryHandler(GetCertificateByTokenIdQuery)
export class GetCertificateByTokenIdHandler implements IQueryHandler<GetCertificateByTokenIdQuery> {
    constructor(
        @InjectRepository(Certificate)
        private readonly repository: Repository<Certificate>
    ) {}

    async execute({ userId, tokenId }: GetCertificateByTokenIdQuery): Promise<ICertificateDTO> {
        const certificate = await this.repository.findOne({ tokenId });

        return certificateToDto(certificate, userId);
    }
}
