import { CertificateBatchOperations } from '@energyweb/issuer';

export class BatchClaimCertificatesCommand {
    constructor(public readonly claims: CertificateBatchOperations.BatchCertificateClaim[]) {}
}
