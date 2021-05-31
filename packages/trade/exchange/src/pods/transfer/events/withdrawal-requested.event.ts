import { Transfer } from '../transfer.entity';

export class WithdrawalRequestedEvent {
    constructor(public readonly transfer: Transfer) {}
}
