/* eslint-disable @typescript-eslint/no-unused-vars */
import { IMatchableProduct } from '@energyweb/exchange-core';

export class MatchableProduct implements IMatchableProduct<string, string> {
    product: string;

    matches(product: string): boolean {
        return true;
    }

    filter(filter: string): boolean {
        return true;
    }
}
