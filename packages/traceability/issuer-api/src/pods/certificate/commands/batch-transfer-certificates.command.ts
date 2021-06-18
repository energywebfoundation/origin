import { BigNumber } from 'ethers';

export class BatchTransferCertificatesCommand {
    constructor(
        public readonly certificateIds: number[],
        public readonly to: string,
        public readonly forAddress: string,
        public readonly values?: BigNumber[]
    ) {}
}
