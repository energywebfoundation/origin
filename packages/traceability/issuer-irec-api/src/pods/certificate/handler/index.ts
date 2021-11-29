import { CertificateHandlers as OriginCertificateHandlers } from '@energyweb/issuer-api';
import { ClaimIRECCertificateHandler } from './claim-irec-certificate.handler';

export { ClaimIRECCertificateHandler };

export const CertificateHandlers = [...OriginCertificateHandlers, ClaimIRECCertificateHandler];
