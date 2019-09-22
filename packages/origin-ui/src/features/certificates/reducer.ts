import { Certificate } from '@energyweb/origin';
import { CertificatesActions, ICertificatesAction } from './actions';

export interface ICertificatesState {
    certificates: Certificate.Entity[];
}

const defaultState: ICertificatesState = {
    certificates: []
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

        default:
            return state;
    }
}
