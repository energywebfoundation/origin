import { CertificateHandlers as OriginCertificateHandlers } from '@energyweb/issuer-api';
import { ClaimIRECCertificateHandler } from './claim-irec-certificate.handler';
import { GetIrecCertificatesToImportHandler } from './get-irec-certificates-to-import.handler';
import { ImportIrecCertificateHandler } from './import-irec-certificate.handler';

export {
    GetIrecCertificatesToImportHandler,
    ImportIrecCertificateHandler,
    ClaimIRECCertificateHandler
};

export const CertificateHandlers = [
    ...OriginCertificateHandlers,
    GetIrecCertificatesToImportHandler,
    ImportIrecCertificateHandler,
    ClaimIRECCertificateHandler
];
