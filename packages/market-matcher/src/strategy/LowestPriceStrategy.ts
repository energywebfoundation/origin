import { Certificate } from '@energyweb/origin';
import { Agreement } from '@energyweb/market';

import { IStrategy } from './IStrategy';

export class LowestPriceStrategy implements IStrategy {
    private agreementPriorities = [
        (a: Agreement.IAgreement, b: Agreement.IAgreement) =>
            a.offChainProperties.price - b.offChainProperties.price
    ];

    private certificatePriorities = [
        (a: Certificate.ICertificate, b: Certificate.ICertificate) => a.price - b.price
    ];

    public executeForAgreements(
        agreements: Agreement.IAgreement[]
    ): Promise<Agreement.IAgreement[]> {
        return Promise.resolve(agreements.sort(this.agreementPriorities[0]));
    }

    public executeForCertificates(
        certificates: Certificate.ICertificate[]
    ): Promise<Certificate.ICertificate[]> {
        return Promise.resolve(certificates.sort(this.certificatePriorities[0]));
    }
}
