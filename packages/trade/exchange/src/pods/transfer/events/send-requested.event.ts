import { Transfer } from '../transfer.entity';

export class SendRequestedEvent {
    constructor(public readonly transfer: Transfer) {}
}
