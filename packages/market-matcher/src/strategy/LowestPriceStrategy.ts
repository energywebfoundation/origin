import { Agreement, PurchasableCertificate } from '@energyweb/market';

import { IStrategy } from '@energyweb/market-matcher-core';

export class LowestPriceStrategy implements IStrategy {
    private agreementPriorities = [
        (a: Agreement.IAgreement, b: Agreement.IAgreement) =>
            a.offChainProperties.price - b.offChainProperties.price
    ];

    private certificatePriorities = [
        (
            a: PurchasableCertificate.IPurchasableCertificate,
            b: PurchasableCertificate.IPurchasableCertificate
        ) => a.price - b.price
    ];

    public executeForAgreements(
        agreements: Agreement.IAgreement[]
    ): Promise<Agreement.IAgreement[]> {
        return Promise.resolve(agreements.sort(this.agreementPriorities[0]));
    }

    public executeForCertificates(
        certificates: PurchasableCertificate.IPurchasableCertificate[]
    ): Promise<PurchasableCertificate.IPurchasableCertificate[]> {
        return Promise.resolve(certificates.sort(this.certificatePriorities[0]));
    }
}
