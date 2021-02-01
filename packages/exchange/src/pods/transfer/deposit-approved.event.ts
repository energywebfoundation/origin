export class DepositApprovedEvent {
    constructor(
        public readonly deviceId: string,
        public readonly address: string,
        public readonly amount: string,
        public readonly assetId: string
    ) {}
}
