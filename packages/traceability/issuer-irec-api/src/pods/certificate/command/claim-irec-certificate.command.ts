import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { IClaimData } from '@energyweb/origin-organization-irec-api';

export class ClaimIRECCertificateCommand {
    constructor(
        public readonly user: ILoggedInUser,
        public readonly certificateId: number,
        public readonly claimData: IClaimData,
        public readonly fromTradeAccount?: string,
        public readonly toRedemptionAccount?: string
    ) {}
}
