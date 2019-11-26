import { Agreement, PurchasableCertificate } from '@energyweb/market';

export interface IStrategy {
    executeForAgreements(agreements: Agreement.IAgreement[]): Promise<Agreement.IAgreement[]>;
    executeForCertificates(
        demands: PurchasableCertificate.IPurchasableCertificate[]
    ): Promise<PurchasableCertificate.IPurchasableCertificate[]>;
}
