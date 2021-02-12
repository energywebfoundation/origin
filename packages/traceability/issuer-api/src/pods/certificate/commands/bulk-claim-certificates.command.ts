import { IClaimData } from '@energyweb/issuer';

export class BulkClaimCertificatesCommand {
    constructor(
        public readonly certificateIds: number[],
        public readonly claimData: IClaimData,
        public readonly forAddress: string
    ) {}
}
