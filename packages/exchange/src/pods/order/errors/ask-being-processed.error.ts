export class AskBeingProcessedError extends Error {
    constructor() {
        super(`Another ask order request is being processed`);
    }
}
