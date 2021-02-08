export class ClaimBeingProcessedError extends Error {
    constructor() {
        super(`Another claim request is being processed`);
    }
}
