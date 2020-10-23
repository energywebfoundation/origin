import { DelegatedTransferOptions } from '../utils/delegated-transfer.dto';

export class TransferCertificateCommand {
    constructor(
        public readonly certificateId: number,
        public readonly from: string,
        public readonly to: string,
        public readonly amount?: string,
        public readonly delegated?: DelegatedTransferOptions
    ) {}
}
