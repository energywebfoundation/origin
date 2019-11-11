import { IStoreState } from '../../types/index';

export const getCertificates = (state: IStoreState) => state.certificates.certificates;

export const getRequestCertificatesModalProducingAsset = (state: IStoreState) =>
    state.certificates.requestCertificatesModal.producingAsset;

export const getRequestCertificatesModalVisible = (state: IStoreState) =>
    state.certificates.requestCertificatesModal.visible;
