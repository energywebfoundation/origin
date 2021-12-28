export class SyncCertificateEvent {
    constructor(public readonly id: string, public readonly byTxHash?: string) {}
}
