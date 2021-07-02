import { BatchIssueCertificateDTO } from './batch-issue-certificates.dto';

export class BatchIssueCertificatesCommand {
    constructor(public readonly certificatesInfo: BatchIssueCertificateDTO[]) {}
}
