import { GetIrecCertificatesToImportHandler } from './get-irec-certificates-to-import.handler';
import { ImportIrecCertificateHandler } from './import-irec-certificate.handler';
import { CertificateHandlers as OriginCertificateHandlers } from '@energyweb/issuer-api';

export * from './get-irec-certificates-to-import.handler';
export * from './import-irec-certificate.handler';
export const CertificateHandlers = [
    ...OriginCertificateHandlers,
    GetIrecCertificatesToImportHandler,
    ImportIrecCertificateHandler
];
