import { TransferDirection } from '../transfer-direction';

export class BeingProcessedError extends Error {
    constructor(direction: TransferDirection) {
        super(`Another ${direction} request is being processed`);
    }
}
