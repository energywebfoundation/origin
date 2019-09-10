import { IStrategy } from './IStrategy';
import { MatchableAgreement } from '../MatchableAgreement';

export class LowestPriceStrategy implements IStrategy {
    private priorities = [
        (a: MatchableAgreement, b: MatchableAgreement) =>
            a.agreement.offChainProperties.price - b.agreement.offChainProperties.price
    ];

    public execute(agreements: MatchableAgreement[]): Promise<MatchableAgreement[]> {
        return Promise.resolve(agreements.sort(this.priorities[0]));
    }
}
