import { PurchasableCertificate } from '@energyweb/market';

import { IStrategy } from '@energyweb/market-matcher-core';

export class LowestPriceStrategy implements IStrategy {
    private certificatePriorities = [
        (
            a: PurchasableCertificate.IPurchasableCertificate,
            b: PurchasableCertificate.IPurchasableCertificate
        ) => a.price - b.price
    ];

    public executeForCertificates(
        certificates: PurchasableCertificate.IPurchasableCertificate[]
    ): Promise<PurchasableCertificate.IPurchasableCertificate[]> {
        return Promise.resolve(certificates.sort(this.certificatePriorities[0]));
    }
}
