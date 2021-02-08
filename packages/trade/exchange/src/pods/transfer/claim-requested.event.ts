import { Transfer } from './transfer.entity';

export class ClaimRequestedEvent {
    constructor(public readonly transfer: Transfer) {}
}
