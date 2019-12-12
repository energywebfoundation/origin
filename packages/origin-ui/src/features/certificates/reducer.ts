import { PurchasableCertificate } from '@energyweb/market';
import { CertificatesActions, ICertificatesAction, ICertificateFetcher } from './actions';
import { ProducingDevice } from '@energyweb/device-registry';
import { IStoreState } from '../../types';

export interface ICertificatesState {
    certificates: PurchasableCertificate.Entity[];
    requestCertificatesModal: {
        visible: boolean;
        producingDevice: ProducingDevice.Entity;
    };
    fetcher: ICertificateFetcher;
}

const fetcher: ICertificateFetcher = {
    async fetch(id: string, configuration: IStoreState['configuration']) {
        return configuration && new PurchasableCertificate.Entity(id, configuration).sync();
    },

    async reload(entity: PurchasableCertificate.Entity) {
        return entity?.sync();
    }
};

const defaultState: ICertificatesState = {
    certificates: [],
    requestCertificatesModal: {
        visible: false,
        producingDevice: null
    },
    fetcher
};

function certificateExists(state: ICertificatesState, id: string) {
    return state.certificates.find(i => i.id.toLowerCase() === id.toLowerCase());
}

export default function reducer(
    state = defaultState,
    action: ICertificatesAction
): ICertificatesState {
    switch (action.type) {
        case CertificatesActions.addCertificate:
            if (certificateExists(state, action.payload.id)) {
                return state;
            }

            return { ...state, certificates: [...state.certificates, action.payload] };

        case CertificatesActions.updateCertificate:
            if (!certificateExists(state, action.payload.id)) {
                console.warn(
                    `Certificate Reducer: trying to update certificate with id ${action.payload.id} that does not exist in store`
                );
                return state;
            }

            const certificateIndex = state.certificates.findIndex(
                c => c.id.toLowerCase() === action.payload.id.toLowerCase()
            );

            return {
                ...state,
                certificates: [
                    ...state.certificates.slice(0, certificateIndex),
                    action.payload,
                    ...state.certificates.slice(certificateIndex + 1)
                ]
            };

        case CertificatesActions.showRequestCertificatesModal:
            return {
                ...state,
                requestCertificatesModal: {
                    ...state.requestCertificatesModal,
                    producingDevice: action.payload.producingDevice
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
                    producingDevice: null
                }
            };

        case CertificatesActions.updateFetcher:
            return {
                ...state,
                fetcher: action.payload
            };

        default:
            return state;
    }
}
