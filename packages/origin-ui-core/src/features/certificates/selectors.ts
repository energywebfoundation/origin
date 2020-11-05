import { ICoreState } from '../../types/index';
import { ICertificatesState } from './reducer';

export const getCertificates = (state: ICoreState) => state.certificatesState.certificates;

export const getRequestCertificatesModalProducingDevice = (state: ICoreState) =>
    state.certificatesState.requestCertificatesModal.producingDevice;

export const getRequestCertificatesModalVisible = (state: ICoreState) =>
    state.certificatesState.requestCertificatesModal.visible;

export const getCertificateById = (
    certificates: ICertificatesState['certificates'],
    id: number
) => {
    if (typeof id === 'undefined') {
        return;
    }

    return certificates.find((i) => i.id === id);
};

export const getCertificateFetcher = (state: ICoreState) => state.certificatesState.fetcher;
