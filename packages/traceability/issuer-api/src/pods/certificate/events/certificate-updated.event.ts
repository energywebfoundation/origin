export class CertificateUpdatedEvent {
    constructor(public readonly certificateId: number, public readonly byTxHash?: string) {}
}
