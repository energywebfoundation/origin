import { ICertificate } from '@energyweb/issuer';

export interface ICertificateViewItem extends ICertificate {
    source: CertificateSource;
    assetId?: string;
}

export enum CertificateSource {
    Blockchain,
    Exchange
}
