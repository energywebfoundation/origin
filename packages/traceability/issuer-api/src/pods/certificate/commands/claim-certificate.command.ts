import { IClaimData } from '@energyweb/issuer';

export class ClaimCertificateCommand {
    constructor(
        public readonly certificateId: number,
        public readonly claimData: IClaimData,
        public readonly forAddress: string,
        public readonly amount?: string
    ) {}
}
