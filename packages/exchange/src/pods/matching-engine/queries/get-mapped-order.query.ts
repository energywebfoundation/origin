import { Order } from '../../order';

export class GetMappedOrderQuery {
    constructor(public readonly order: Order) {}
}
