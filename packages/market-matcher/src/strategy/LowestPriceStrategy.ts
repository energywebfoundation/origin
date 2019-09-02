import { Agreement } from '@energyweb/market';

import { IStrategy } from './IStrategy';

export class LowestPriceStrategy implements IStrategy {
    private priorities = [
        (a: Agreement.Entity, b: Agreement.Entity) =>
            a.offChainProperties.price - b.offChainProperties.price
    ];

    public execute(agreements: Agreement.Entity[]): Promise<Agreement.Entity[]> {
        return Promise.resolve(agreements.sort(this.priorities[0]));
    }
}
