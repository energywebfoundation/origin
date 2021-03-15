interface IPrivateCertificateInfo {
    owner: string;
    energy: string;
}

export class CertificateCreatedEvent {
    constructor(
        public readonly tokenId: number,
        public readonly privateInfo?: IPrivateCertificateInfo
    ) {}
}
