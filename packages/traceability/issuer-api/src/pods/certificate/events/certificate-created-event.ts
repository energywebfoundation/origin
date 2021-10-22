interface IPrivateCertificateInfo {
    owner: string;
    energy: string;
}

export class CertificateCreatedEvent {
    constructor(
        public readonly id: number,
        public readonly byTxHash?: string,
        public readonly privateInfo?: IPrivateCertificateInfo
    ) {}
}
