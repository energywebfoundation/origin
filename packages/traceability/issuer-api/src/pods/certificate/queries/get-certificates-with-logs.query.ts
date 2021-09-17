import { Certificate } from '../certificate.entity';
import { TransactionLog } from '../transaction-log.entity';

export type GetCertificatesWithLogsParams = { deviceIds: string[]; from: Date; to: Date };
// actually this is expected to work with more interfaces, like querying by certificateIds for example
// use union type for that. Creating separate queries would be overkill

export class GetCertificatesWithLogsQuery {
    constructor(public params: GetCertificatesWithLogsParams) {}
}

export type CertificateWithLogs = Certificate & { transactionLogs: TransactionLog[] };
export type GetCertificatesWithLogsResponse = CertificateWithLogs[];
