import { Certificate } from '@energyweb/origin';
import { Agreement } from '@energyweb/market';

export interface IStrategy {
    executeForAgreements(agreements: Agreement.IAgreement[]): Promise<Agreement.IAgreement[]>;
    executeForCertificates(
        demands: Certificate.ICertificate[]
    ): Promise<Certificate.ICertificate[]>;
}
