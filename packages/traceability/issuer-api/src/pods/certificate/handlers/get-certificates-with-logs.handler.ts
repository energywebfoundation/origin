import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { Certificate } from '../certificate.entity';
import {
    GetCertificatesWithLogsQuery,
    GetCertificatesWithLogsResponse
} from '../queries/get-certificates-with-logs.query';
import { TransactionLogService } from '../transaction-log.service';

@QueryHandler(GetCertificatesWithLogsQuery)
export class GetCertificatesWithLogsHandler implements IQueryHandler<GetCertificatesWithLogsQuery> {
    constructor(
        @InjectRepository(Certificate)
        private readonly certificateRepository: Repository<Certificate>,
        private readonly logService: TransactionLogService
    ) {}

    public async execute({
        params
    }: GetCertificatesWithLogsQuery): Promise<GetCertificatesWithLogsResponse> {
        if ('deviceIds' in params) {
            return await this.findByDevices(params.deviceIds, params.from, params.to);
        }
    }

    private async findByDevices(
        deviceIds: string[],
        from: Date,
        to: Date
    ): Promise<GetCertificatesWithLogsResponse> {
        const certificates = await this.certificateRepository.find({
            where: {
                deviceId: In(deviceIds),
                generationEndTime: Between(
                    Math.floor(from.getTime() / 1000),
                    Math.floor(to.getTime() / 1000)
                )
            }
        });

        const logs = await this.logService.findByCertificateIds(certificates.map((c) => c.id));

        return certificates.map((c) => ({
            ...c,
            transactionLogs: logs.filter((l) => l.certificateId === String(c.id))
        }));
    }
}
