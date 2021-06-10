interface IPrivateCertificateInfo {
    owner: string;
    energy: string;
}

export class CertificateCreatedEvent {
    constructor(
        public readonly id: number,
        public readonly privateInfo?: IPrivateCertificateInfo
    ) {}
}
