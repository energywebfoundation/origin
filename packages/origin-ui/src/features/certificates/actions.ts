import { PurchasableCertificate } from '@energyweb/market';
import { ProducingDevice } from '@energyweb/device-registry';
import { IStoreState } from '../../types';

export enum CertificatesActions {
    addCertificate = 'CERTIFICATE_CREATED',
    updateCertificate = 'CERTIFICATE_UPDATED',
    requestCertificates = 'REQUEST_CERTIFICATES',
    showRequestCertificatesModal = 'SHOW_REQUEST_CERTIFICATES_MODAL',
    setRequestCertificatesModalVisibility = 'SET_REQUEST_CERTIFICATES_MODAL_VISIBILITY',
    hideRequestCertificatesModal = 'HIDE_REQUEST_CERTIFICATES_MODAL',
    requestCertificateEntityFetch = 'REQUEST_CERTIFICATE_ENTITY_FETCH',
    updateFetcher = 'CERTIFICATES_UPDATE_FETCHER'
}

export interface IAddCertificateAction {
    type: CertificatesActions.addCertificate;
    payload: PurchasableCertificate.Entity;
}

export const addCertificate = (payload: PurchasableCertificate.Entity) => ({
    type: CertificatesActions.addCertificate,
    payload
});

export type TAddCertificateAction = typeof addCertificate;

export interface IUpdateCertificateAction {
    type: CertificatesActions.updateCertificate;
    payload: PurchasableCertificate.Entity;
}

export const updateCertificate = (payload: PurchasableCertificate.Entity) => ({
    type: CertificatesActions.updateCertificate,
    payload
});

export type TUpdateCertificateAction = typeof updateCertificate;

export interface IRequestCertificatesAction {
    type: CertificatesActions.requestCertificates;
    payload: {
        deviceId: string;
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
        producingDevice: ProducingDevice.Entity;
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

export interface IRequestCertificateEntityFetchAction {
    type: CertificatesActions.requestCertificateEntityFetch;
    payload: string;
}

export const requestCertificateEntityFetch = (
    payload: IRequestCertificateEntityFetchAction['payload']
) => ({
    type: CertificatesActions.requestCertificateEntityFetch,
    payload
});

export type TRequestUserCertificateEntityFetchAction = typeof requestCertificateEntityFetch;

export interface ICertificateFetcher {
    fetch(
        id: string,
        configuration: IStoreState['configuration']
    ): Promise<PurchasableCertificate.Entity>;

    reload(entity: PurchasableCertificate.Entity): Promise<PurchasableCertificate.Entity>;
}

export interface IUpdateFetcherAction {
    type: CertificatesActions.updateFetcher;
    payload: ICertificateFetcher;
}

export const updateFetcher = (payload: IUpdateFetcherAction['payload']) => ({
    type: CertificatesActions.updateFetcher,
    payload
});

export type TUpdateFetcherAction = typeof updateFetcher;

export type ICertificatesAction =
    | IAddCertificateAction
    | IUpdateCertificateAction
    | IRequestCertificatesAction
    | IShowRequestCertificatesModalAction
    | ISetRequestCertificatesModalVisibilityAction
    | IHideRequestCertificatesModalAction
    | IRequestCertificateEntityFetchAction
    | IUpdateFetcherAction;
