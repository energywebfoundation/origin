import { Certificate } from '@energyweb/origin';

export enum CertificatesActions {
    certificateCreatedOrUpdated = 'CERTIFICATE_CREATED_OR_UPDATED'
}

export interface ICertificateCreatedOrUpdatedAction {
    type: CertificatesActions.certificateCreatedOrUpdated;
    certificate: Certificate.Entity;
}

export const certificateCreatedOrUpdated = (certificate: Certificate.Entity) => ({
    type: CertificatesActions.certificateCreatedOrUpdated,
    certificate
});

export type TCertificateCreatedOrUpdatedAction = typeof certificateCreatedOrUpdated;

export type ICertificatesAction = ICertificateCreatedOrUpdatedAction;
