import { CreateDepositDTO } from '../dto/create-deposit.dto';

export class DepositDiscoveredEvent {
    constructor(public readonly deposit: CreateDepositDTO) {}
}
