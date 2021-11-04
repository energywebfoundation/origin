export class SyncCertificateEvent {
    constructor(public readonly id: number, public readonly byTxHash?: string) {}
}
