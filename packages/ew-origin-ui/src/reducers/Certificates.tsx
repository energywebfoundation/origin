import * as OriginIssuer from 'ew-origin-lib';
import { Actions } from '../actions/index'

const defaultState = [];

export default function reducer(state =  defaultState, action) {

    switch (action.type) {

        case Actions.certificateCreatedOrUpdated:
            const certificateIndex: number = state.findIndex((c: OriginIssuer.Certificate.Entity) => c.id === action.certificate.id)
            return certificateIndex === -1 ? 
                [...state, action.certificate] :
                [...state.slice(0, certificateIndex), action.certificate, ...state.slice(certificateIndex + 1)]

        default:
            return state;
    }
}