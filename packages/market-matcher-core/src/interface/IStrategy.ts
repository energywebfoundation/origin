import { PurchasableCertificate } from '@energyweb/market';

export interface IStrategy {
    executeForCertificates(
        demands: PurchasableCertificate.IPurchasableCertificate[]
    ): Promise<PurchasableCertificate.IPurchasableCertificate[]>;
}
