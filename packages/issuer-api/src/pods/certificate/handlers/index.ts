import { GetAllCertificatesHandler } from './get-all-certificates.handler';
import { IssueCertificateHandler } from './issue-certificate.handler';
import { TransferCertificateHandler } from './transfer-certificate.handler';
import { GetCertificateHandler } from './get-certificate.handler';
import { ClaimCertificateHandler } from './claim-certificate.handler';
import { GetCertificateByTokenIdHandler } from './get-certificate-by-token.handler';
import { GetAggregateCertifiedEnergyDeviceIdHandler } from './get-aggregare-certified-energy-by-device.handler';
import { CertificateCreatedHandler } from './certificate-created.handler';
import { BulkClaimCertificatesHandler } from './bulk-claim-certificates.handler';
import { GetAllCertificateEventsHandler } from './get-all-certificate-events.handler';
import { SyncCertificateHandler } from './sync-certificate.handler';

export const Handlers = [
    GetAllCertificatesHandler,
    IssueCertificateHandler,
    TransferCertificateHandler,
    GetCertificateHandler,
    ClaimCertificateHandler,
    GetCertificateByTokenIdHandler,
    CertificateCreatedHandler,
    BulkClaimCertificatesHandler,
    GetAllCertificateEventsHandler,
    SyncCertificateHandler,
    GetAggregateCertifiedEnergyDeviceIdHandler
];
