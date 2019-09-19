import { Certificate } from '@energyweb/origin';
import { MatchableAgreement } from '../MatchableAgreement';

export interface IStrategy {
    executeForAgreements(agreements: MatchableAgreement[]): Promise<MatchableAgreement[]>;
    executeForCertificates(
        demands: Certificate.ICertificate[]
    ): Promise<Certificate.ICertificate[]>;
}
