import { IClaimData } from '@energyweb/issuer';
import { BigNumber } from 'ethers';

export class BatchClaimCertificatesCommand {
    constructor(
        public readonly certificateIds: number[],
        public readonly claimData: IClaimData,
        public readonly forAddress: string,
        public readonly values?: BigNumber[]
    ) {}
}
