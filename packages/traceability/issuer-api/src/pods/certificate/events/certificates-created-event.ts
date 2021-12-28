interface IPrivateCertificateInfo {
    owner: string;
    energy: string;
}

export class CertificatesCreatedEvent {
    constructor(
        public readonly ids: string[],
        public readonly privateInfo?: IPrivateCertificateInfo
    ) {}
}
