import { IStoreState } from '../../types/index';
import { ICertificatesState } from './reducer';

export const getCertificates = (state: IStoreState) => state.certificates.certificates;

export const getRequestCertificatesModalProducingDevice = (state: IStoreState) =>
    state.certificates.requestCertificatesModal.producingDevice;

export const getRequestCertificatesModalVisible = (state: IStoreState) =>
    state.certificates.requestCertificatesModal.visible;

export const getCertificateById = (
    certificates: ICertificatesState['certificates'],
    id: number
) => {
    if (typeof id === 'undefined') {
        return;
    }

    return certificates.find((i) => i.id === id);
};

export const getCertificatesClient = (state: IStoreState) => state.certificates.certificatesClient;

export const getCertificationRequestsClient = (state: IStoreState) =>
    state.certificates.certificationRequestsClient;
