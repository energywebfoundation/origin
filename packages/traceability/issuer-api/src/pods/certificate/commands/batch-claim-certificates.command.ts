import { CertificateBatchOperations } from '@energyweb/issuer';

export class BatchClaimCertificatesCommand {
    constructor(
        public readonly claims: Omit<
            CertificateBatchOperations.BatchCertificateClaim,
            'schemaVersion'
        >[]
    ) {}
}
