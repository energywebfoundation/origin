import { BatchIssueCertificateDTO } from '../dto/batch-issue-certificates.dto';

export class BatchIssueCertificatesCommand {
    constructor(public readonly certificatesInfo: BatchIssueCertificateDTO[]) {}
}
