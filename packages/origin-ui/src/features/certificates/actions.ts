import { Certificate } from '@energyweb/origin';

export enum CertificatesActions {
    certificateCreatedOrUpdated = 'CERTIFICATE_CREATED_OR_UPDATED',
    requestCertificates = 'REQUEST_CERTIFICATES'
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

export interface IRequestCertificatesAction {
    type: CertificatesActions.requestCertificates;
    payload: {
        assetId: string;
        lastReadIndex: number;
        energy: number;
    };
}

export const requestCertificates = (payload: IRequestCertificatesAction['payload']) => ({
    type: CertificatesActions.requestCertificates,
    payload
});

export type TRequestCertificatesAction = typeof requestCertificates;

export type ICertificatesAction = ICertificateCreatedOrUpdatedAction | IRequestCertificatesAction;
