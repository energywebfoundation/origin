import { Order } from '..';

export class SubmitOrderCommand {
    constructor(public readonly order: Order) {}
}
