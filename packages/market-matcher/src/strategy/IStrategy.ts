import { Agreement } from '@energyweb/market';

export interface IStrategy {
    execute(agreements: Agreement.Entity[]): Promise<Agreement.Entity[]>;
}
