export class CertificateUpdatedEvent {
    constructor(public readonly certificateId: string, public readonly byTxHash?: string) {}
}
