interface IPrivateCertificateInfo {
    owner: string;
    energy: string;
}

export class CertificateCreatedEvent {
    constructor(
        public readonly certificateId: number,
        public readonly privateInfo?: IPrivateCertificateInfo
    ) {}
}
