import { CreateDepositDTO } from '../dto';

export class DepositDiscoveredEvent {
    constructor(public readonly deposit: CreateDepositDTO) {}
}
