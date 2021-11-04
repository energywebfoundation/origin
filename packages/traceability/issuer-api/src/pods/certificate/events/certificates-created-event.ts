interface IPrivateCertificateInfo {
    owner: string;
    energy: string;
}

export class CertificatesCreatedEvent {
    constructor(
        public readonly ids: number[],
        public readonly privateInfo?: IPrivateCertificateInfo
    ) {}
}
