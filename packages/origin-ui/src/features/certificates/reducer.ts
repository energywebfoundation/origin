import { Certificate } from '@energyweb/origin';
import { CertificatesActions, ICertificatesAction } from './actions';
import { ProducingAsset } from '@energyweb/asset-registry';

export interface ICertificatesState {
    certificates: Certificate.Entity[];
    requestCertificatesModal: {
        visible: boolean;
        producingAsset: ProducingAsset.Entity;
    };
}

const defaultState: ICertificatesState = {
    certificates: [],
    requestCertificatesModal: {
        visible: false,
        producingAsset: null
    }
};

export default function reducer(
    state = defaultState,
    action: ICertificatesAction
): ICertificatesState {
    switch (action.type) {
        case CertificatesActions.certificateCreatedOrUpdated:
            const certificateIndex: number = state.certificates.findIndex(
                c => c.id === action.certificate.id
            );

            return {
                ...state,
                certificates:
                    certificateIndex === -1
                        ? [...state.certificates, action.certificate]
                        : [
                              ...state.certificates.slice(0, certificateIndex),
                              action.certificate,
                              ...state.certificates.slice(certificateIndex + 1)
                          ]
            };

        case CertificatesActions.showRequestCertificatesModal:
            return {
                ...state,
                requestCertificatesModal: {
                    ...state.requestCertificatesModal,
                    producingAsset: action.payload.producingAsset
                }
            };

        case CertificatesActions.setRequestCertificatesModalVisibility:
            return {
                ...state,
                requestCertificatesModal: {
                    ...state.requestCertificatesModal,
                    visible: true
                }
            };

        case CertificatesActions.hideRequestCertificatesModal:
            return {
                ...state,
                requestCertificatesModal: {
                    visible: false,
                    producingAsset: null
                }
            };

        default:
            return state;
    }
}
