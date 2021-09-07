import { CertificateBatchOperations } from '@energyweb/issuer';

export class BatchTransferCertificatesCommand {
    constructor(public readonly transfers: CertificateBatchOperations.BatchCertificateTransfer[]) {}
}
