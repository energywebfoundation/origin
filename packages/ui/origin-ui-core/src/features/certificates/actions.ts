import { Certificate, IClaimData } from '@energyweb/issuer';
import {
    BlockchainPropertiesClient,
    CertificateAmountDTO,
    CertificatesClient,
    CertificationRequestsClient
} from '@energyweb/issuer-api-client';
import { BigNumber } from 'ethers';
import { CertificateSource, ICertificateViewItem, ICertificationRequest } from './types';

export enum CertificatesActions {
    addCertificate = 'CERTIFICATE_CREATED',
    updateCertificate = 'CERTIFICATE_UPDATED',
    resyncCertificate = 'CERTIFICATE_RESYNC',
    requestCertificates = 'REQUEST_CERTIFICATES',
    requestCertificateEntityFetch = 'REQUEST_CERTIFICATE_ENTITY_FETCH',
    requestPublishForSale = 'CERTIFICATES_REQUEST_PUBLISH_FOR_SALE',
    requestClaimCertificate = 'CERTIFICATES_REQUEST_CLAIM_CERTIFICATE',
    requestClaimCertificateBulk = 'CERTIFICATES_REQUEST_CLAIM_CERTIFICATE_BULK',
    requestCertificateApproval = 'CERTIFICATES_REQUEST_CERTIFICATE_APPROVAL',
    withdrawCertificate = 'CERTIFICATES_REQUEST_CERTIFICATE_WITHDRAWAL',
    requestDepositCertificate = 'CERTIFICATES_REQUEST_CERTIFICATE_DEPOSIT',
    clearCertificates = 'CERTIFICATES_CLEAR_CERTIFICATES',
    reloadCertificates = 'CERTIFICATES_RELOAD_CERTIFICATES',
    setBlockchainPropertiesClient = 'CERTIFICATES_SET_BLOCKCHAIN_PROPERTIES_CLIENT',
    setCertificatesClient = 'CERTIFICATES_SET_CERTIFICATES_CLIENT',
    setCertificationRequestsClient = 'CERTIFICATES_SET_CERTIFICATION_REQUESTS_CLIENT'
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
        requestData: {
            deviceId: string;
            energy: BigNumber;
            startTime: number;
            endTime: number;
            files: string[];
        };
        callback?: () => void;
    };
}

export const requestCertificates = (payload: IRequestCertificatesAction['payload']) => ({
    type: CertificatesActions.requestCertificates,
    payload
});

export type TRequestCertificatesAction = typeof requestCertificates;

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
        callback?: () => void;
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
        certificateAmounts: CertificateAmountDTO[];
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
        certificationRequestId: ICertificationRequest['id'];
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

export interface ISetBlockchainPropertiesClientAction {
    type: CertificatesActions.setBlockchainPropertiesClient;
    payload: BlockchainPropertiesClient;
}

export const setBlockchainPropertiesClient = (
    payload: ISetBlockchainPropertiesClientAction['payload']
) => ({
    type: CertificatesActions.setBlockchainPropertiesClient,
    payload
});

export type TSetBlockchainPropertiesClientAction = typeof setBlockchainPropertiesClient;

export interface ISetCertificatesClientAction {
    type: CertificatesActions.setCertificatesClient;
    payload: CertificatesClient;
}

export const setCertificatesClient = (payload: ISetCertificatesClientAction['payload']) => ({
    type: CertificatesActions.setCertificatesClient,
    payload
});

export type TSetCertificatesClientAction = typeof setCertificatesClient;

export interface ISetCertificationRequestsClientAction {
    type: CertificatesActions.setCertificationRequestsClient;
    payload: CertificationRequestsClient;
}

export const setCertificationRequestsClient = (
    payload: ISetCertificationRequestsClientAction['payload']
) => ({
    type: CertificatesActions.setCertificationRequestsClient,
    payload
});

export type TSetCertificationRequestsClientAction = typeof setCertificationRequestsClient;

export type ICertificatesAction =
    | IAddCertificateAction
    | IUpdateCertificateAction
    | IResyncCertificateAction
    | IRequestCertificatesAction
    | IRequestCertificateEntityFetchAction
    | IRequestPublishForSaleAction
    | IRequestClaimCertificateAction
    | IRequestClaimCertificateBulkAction
    | IRequestCertificateApprovalAction
    | IClearCertificatesAction
    | IReloadCertificatesAction
    | IRequestWithdrawCertificateAction
    | ISetBlockchainPropertiesClientAction
    | ISetCertificatesClientAction
    | ISetCertificationRequestsClientAction;
