import { IStoreState } from '../../types/index';
import { ICertificatesState } from './reducer';

export const getCertificates = (state: IStoreState) => state.certificates.certificates;

export const getRequestCertificatesModalProducingDevice = (state: IStoreState) =>
    state.certificates.requestCertificatesModal.producingDevice;

export const getRequestCertificatesModalVisible = (state: IStoreState) =>
    state.certificates.requestCertificatesModal.visible;

export const getCertificateById = (
    certificates: ICertificatesState['certificates'],
    id: string
) => {
    if (typeof id === 'undefined') {
        return;
    }

    return certificates.find(i => i.id.toLowerCase() === id.toLowerCase());
};

export const getCertificateFetcher = (state: IStoreState) => state.certificates.fetcher;
