import { IClaimData } from '@energyweb/issuer';
import { CertificateAmount } from '../types';

export class BatchClaimCertificatesCommand {
    constructor(
        public readonly certificateAmounts: CertificateAmount[],
        public readonly claimData: IClaimData,
        public readonly forAddress: string
    ) {}
}
