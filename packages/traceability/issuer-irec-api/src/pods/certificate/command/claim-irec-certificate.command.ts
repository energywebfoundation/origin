import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { IClaimData } from '@energyweb/issuer';

export class ClaimIRECCertificateCommand {
    constructor(
        public readonly user: ILoggedInUser,
        public readonly certificateId: number,
        public readonly claimData: IClaimData
    ) {}
}
