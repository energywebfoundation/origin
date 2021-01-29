import { CreateDepositDTO } from './create-deposit.dto';

export class DepositDiscoveredEvent {
    constructor(public readonly deposit: CreateDepositDTO) {}
}
