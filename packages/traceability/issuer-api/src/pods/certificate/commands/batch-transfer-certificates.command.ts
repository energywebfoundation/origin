import { CertificateAmount } from '../types';

export class BatchTransferCertificatesCommand {
    constructor(
        public readonly certificateAmounts: CertificateAmount[],
        public readonly to: string,
        public readonly forAddress: string
    ) {}
}
