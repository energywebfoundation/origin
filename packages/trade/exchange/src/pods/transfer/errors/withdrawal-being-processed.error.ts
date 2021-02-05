export class WithdrawalBeingProcessedError extends Error {
    constructor() {
        super(`Another withdrawal request is being processed`);
    }
}
