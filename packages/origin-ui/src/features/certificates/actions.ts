import { Certificate } from '@energyweb/origin';
import { ProducingAsset } from '@energyweb/asset-registry';

export enum CertificatesActions {
    certificateCreatedOrUpdated = 'CERTIFICATE_CREATED_OR_UPDATED',
    requestCertificates = 'REQUEST_CERTIFICATES',
    showRequestCertificatesModal = 'SHOW_REQUEST_CERTIFICATES_MODAL',
    setRequestCertificatesModalVisibility = 'SET_REQUEST_CERTIFICATES_MODAL_VISIBILITY',
    hideRequestCertificatesModal = 'HIDE_REQUEST_CERTIFICATES_MODAL'
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

export interface IShowRequestCertificatesModalAction {
    type: CertificatesActions.showRequestCertificatesModal;
    payload: {
        producingAsset: ProducingAsset.Entity;
    };
}

export const showRequestCertificatesModal = (
    payload: IShowRequestCertificatesModalAction['payload']
) => ({
    type: CertificatesActions.showRequestCertificatesModal,
    payload
});

export type TShowRequestCertificatesModalAction = typeof showRequestCertificatesModal;

export interface IHideRequestCertificatesModalAction {
    type: CertificatesActions.hideRequestCertificatesModal;
}

export const hideRequestCertificatesModal = () => ({
    type: CertificatesActions.hideRequestCertificatesModal
});

export type THideRequestCertificatesModalAction = typeof hideRequestCertificatesModal;

export interface ISetRequestCertificatesModalVisibilityAction {
    type: CertificatesActions.setRequestCertificatesModalVisibility;
    payload: boolean;
}

export const setRequestCertificatesModalVisibility = (
    payload: ISetRequestCertificatesModalVisibilityAction['payload']
) => ({
    type: CertificatesActions.setRequestCertificatesModalVisibility,
    payload
});

export type TSetRequestCertificatesModalVisibilityAction = typeof setRequestCertificatesModalVisibility;

export type ICertificatesAction =
    | ICertificateCreatedOrUpdatedAction
    | IRequestCertificatesAction
    | IShowRequestCertificatesModalAction
    | ISetRequestCertificatesModalVisibilityAction
    | IHideRequestCertificatesModalAction;
