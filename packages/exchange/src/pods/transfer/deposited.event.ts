import { Transfer } from './transfer.entity';

export class DepositedEvent {
    constructor(public readonly transfer: Transfer) {}
}
