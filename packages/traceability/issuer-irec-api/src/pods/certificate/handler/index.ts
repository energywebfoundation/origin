import { GetIrecCertificatesToImportHandler } from './get-irec-certificates-to-import.handler';
import { CertificateHandlers as OriginCertificateHandlers } from '@energyweb/issuer-api';

export * from './get-irec-certificates-to-import.handler';
export const CertificateHandlers = [
    ...OriginCertificateHandlers,
    GetIrecCertificatesToImportHandler
];
