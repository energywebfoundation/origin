import { MatchableAgreement } from '../MatchableAgreement';

export interface IStrategy {
    execute(agreements: MatchableAgreement[]): Promise<MatchableAgreement[]>;
}
