import { Certificate } from '@energyweb/origin';

import { MatchableAgreement } from '../MatchableAgreement';
import { IStrategy } from './IStrategy';

export class LowestPriceStrategy implements IStrategy {
    private agreementPriorities = [
        (a: MatchableAgreement, b: MatchableAgreement) =>
            a.agreement.offChainProperties.price - b.agreement.offChainProperties.price
    ];

    private certificatePriorities = [
        (a: Certificate.ICertificate, b: Certificate.ICertificate) => a.price() - b.price()
    ];

    public executeForAgreements(agreements: MatchableAgreement[]): Promise<MatchableAgreement[]> {
        return Promise.resolve(agreements.sort(this.agreementPriorities[0]));
    }

    public executeForCertificates(
        certificates: Certificate.ICertificate[]
    ): Promise<Certificate.ICertificate[]> {
        return Promise.resolve(certificates.sort(this.certificatePriorities[0]));
    }
}
