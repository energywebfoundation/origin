import { ProducingDevice } from '@energyweb/device-registry';
import { Certificate, CertificationRequest, IClaimData } from '@energyweb/issuer';
import { BigNumber } from 'ethers';

import { ICertificateViewItem, CertificateSource } from '.';
import { IStoreState } from '../../types';

export enum CertificatesActions {
    addCertificate = 'CERTIFICATE_CREATED',
    updateCertificate = 'CERTIFICATE_UPDATED',
    resyncCertificate = 'CERTIFICATE_RESYNC',
    requestCertificates = 'REQUEST_CERTIFICATES',
    showRequestCertificatesModal = 'SHOW_REQUEST_CERTIFICATES_MODAL',
    setRequestCertificatesModalVisibility = 'SET_REQUEST_CERTIFICATES_MODAL_VISIBILITY',
    hideRequestCertificatesModal = 'HIDE_REQUEST_CERTIFICATES_MODAL',
    requestCertificateEntityFetch = 'REQUEST_CERTIFICATE_ENTITY_FETCH',
    updateFetcher = 'CERTIFICATES_UPDATE_FETCHER',
    requestPublishForSale = 'CERTIFICATES_REQUEST_PUBLISH_FOR_SALE',
    requestClaimCertificate = 'CERTIFICATES_REQUEST_CLAIM_CERTIFICATE',
    requestClaimCertificateBulk = 'CERTIFICATES_REQUEST_CLAIM_CERTIFICATE_BULK',
    requestCertificateApproval = 'CERTIFICATES_REQUEST_CERTIFICATE_APPROVAL',
    withdrawCertificate = 'CERTIFICATES_REQUEST_CERTIFICATE_WITHDRAWAL',
    requestDepositCertificate = 'CERTIFICATES_REQUEST_CERTIFICATE_DEPOSIT',
    clearCertificates = 'CERTIFICATES_CLEAR_CERTIFICATES',
    reloadCertificates = 'CERTIFICATES_RELOAD_CERTIFICATES'
}

export interface IAddCertificateAction {
    type: CertificatesActions.addCertificate;
    payload: ICertificateViewItem;
}

export const addCertificate = (payload: ICertificateViewItem) => ({
    type: CertificatesActions.addCertificate,
    payload
});

export type TAddCertificateAction = typeof addCertificate;

export interface IUpdateCertificateAction {
    type: CertificatesActions.updateCertificate;
    payload: ICertificateViewItem;
}

export const updateCertificate = (payload: ICertificateViewItem) => ({
    type: CertificatesActions.updateCertificate,
    payload
});

export type TUpdateCertificateAction = typeof updateCertificate;

export interface IResyncCertificateAction {
    type: CertificatesActions.resyncCertificate;
    payload: ICertificateViewItem;
}

export const resyncCertificate = (payload: ICertificateViewItem) => ({
    type: CertificatesActions.resyncCertificate,
    payload
});

export type TResyncCertificateAction = typeof resyncCertificate;

export interface IRequestCertificatesAction {
    type: CertificatesActions.requestCertificates;
    payload: {
        deviceId: string;
        energy: BigNumber;
        startTime: number;
        endTime: number;
        files: string[];
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
    payload: number;
}

export const requestCertificateEntityFetch = (
    payload: IRequestCertificateEntityFetchAction['payload']
) => ({
    type: CertificatesActions.requestCertificateEntityFetch,
    payload
});

export type TRequestUserCertificateEntityFetchAction = typeof requestCertificateEntityFetch;

export interface ICertificateFetcher {
    fetch(id: number, configuration: IStoreState['configuration']): Promise<Certificate>;

    reload(entity: Certificate): Promise<Certificate>;
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

export interface IRequestPublishForSaleAction {
    type: CertificatesActions.requestPublishForSale;
    payload: {
        certificateId: Certificate['id'];
        amount: BigNumber;
        price: number;
        source: CertificateSource;
        assetId?: string;
        callback: () => void;
    };
}

export const requestPublishForSale = (payload: IRequestPublishForSaleAction['payload']) => ({
    type: CertificatesActions.requestPublishForSale,
    payload
});

export type TRequestPublishForSaleAction = typeof requestPublishForSale;

export interface IRequestClaimCertificateAction {
    type: CertificatesActions.requestClaimCertificate;
    payload: {
        certificateId: Certificate['id'];
        amount: BigNumber;
        claimData: IClaimData;
    };
}

export const requestClaimCertificate = (payload: IRequestClaimCertificateAction['payload']) => ({
    type: CertificatesActions.requestClaimCertificate,
    payload
});

export type TRequestClaimCertificateAction = typeof requestClaimCertificate;

export interface IRequestClaimCertificateBulkAction {
    type: CertificatesActions.requestClaimCertificateBulk;
    payload: {
        certificateIds: Certificate['id'][];
        claimData: IClaimData;
    };
}

export const requestClaimCertificateBulk = (
    payload: IRequestClaimCertificateBulkAction['payload']
) => ({
    type: CertificatesActions.requestClaimCertificateBulk,
    payload
});

export type TRequestClaimCertificateBulkAction = typeof requestClaimCertificateBulk;

export interface IRequestCertificateApprovalAction {
    type: CertificatesActions.requestCertificateApproval;
    payload: {
        certificationRequest: CertificationRequest;
        callback: () => void;
    };
}

export const requestCertificateApproval = (
    payload: IRequestCertificateApprovalAction['payload']
) => ({
    type: CertificatesActions.requestCertificateApproval,
    payload
});

export type TRequestCertificateApprovalAction = typeof requestCertificateApproval;

export interface IRequestWithdrawCertificateAction {
    type: CertificatesActions.withdrawCertificate;
    payload: {
        assetId: string;
        address: string;
        amount: string;
        callback: () => void;
    };
}

export const requestWithdrawCertificate = (
    payload: IRequestWithdrawCertificateAction['payload']
) => ({
    type: CertificatesActions.withdrawCertificate,
    payload
});

export interface IRequestDepositCertificateAction {
    type: CertificatesActions.withdrawCertificate;
    payload: {
        certificateId: Certificate['id'];
        amount: BigNumber;
        callback: () => void;
    };
}

export const requestDepositCertificate = (
    payload: IRequestDepositCertificateAction['payload']
) => ({
    type: CertificatesActions.requestDepositCertificate,
    payload
});

export interface IClearCertificatesAction {
    type: CertificatesActions.clearCertificates;
}

export const clearCertificates = () => ({
    type: CertificatesActions.clearCertificates
});

export interface IReloadCertificatesAction {
    type: CertificatesActions.reloadCertificates;
}

export const reloadCertificates = () => ({
    type: CertificatesActions.reloadCertificates
});

export type ICertificatesAction =
    | IAddCertificateAction
    | IUpdateCertificateAction
    | IResyncCertificateAction
    | IRequestCertificatesAction
    | IShowRequestCertificatesModalAction
    | ISetRequestCertificatesModalVisibilityAction
    | IHideRequestCertificatesModalAction
    | IRequestCertificateEntityFetchAction
    | IUpdateFetcherAction
    | IRequestPublishForSaleAction
    | IRequestClaimCertificateAction
    | IRequestClaimCertificateBulkAction
    | IRequestCertificateApprovalAction
    | IClearCertificatesAction
    | IReloadCertificatesAction
    | IRequestWithdrawCertificateAction;
