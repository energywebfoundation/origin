import { BatchClaimCertificatesHandler } from './batch-claim-certificates.handler';
import { BatchIssueCertificatesHandler } from './batch-issue-certificates.handler';
import { BatchTransferCertificatesHandler } from './batch-transfer-certificates.handler';
import { CertificateCreatedHandler } from './certificate-created.handler';
import { ClaimCertificateHandler } from './claim-certificate.handler';
import { GetAggregateCertifiedEnergyDeviceIdHandler } from './get-aggregare-certified-energy-by-device.handler';
import { GetAllCertificateEventsHandler } from './get-all-certificate-events.handler';
import { GetAllCertificatesHandler } from './get-all-certificates.handler';
import { GetCertificateHandler } from './get-certificate.handler';
import { IssueCertificateHandler } from './issue-certificate.handler';
import { SyncCertificateHandler } from './sync-certificate.handler';
import { TransferCertificateHandler } from './transfer-certificate.handler';

export {
    BatchClaimCertificatesHandler,
    BatchIssueCertificatesHandler,
    BatchTransferCertificatesHandler,
    CertificateCreatedHandler,
    ClaimCertificateHandler,
    GetAggregateCertifiedEnergyDeviceIdHandler,
    GetAllCertificateEventsHandler,
    GetAllCertificatesHandler,
    GetCertificateHandler,
    IssueCertificateHandler,
    SyncCertificateHandler,
    TransferCertificateHandler
};

export const CertificateHandlers = [
    BatchClaimCertificatesHandler,
    BatchIssueCertificatesHandler,
    BatchTransferCertificatesHandler,
    CertificateCreatedHandler,
    ClaimCertificateHandler,
    GetAggregateCertifiedEnergyDeviceIdHandler,
    GetAllCertificateEventsHandler,
    GetAllCertificatesHandler,
    GetCertificateHandler,
    IssueCertificateHandler,
    SyncCertificateHandler,
    TransferCertificateHandler
];
