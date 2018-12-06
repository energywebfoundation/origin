// import { Certificate } from 'ewf-coo'
// import { Actions } from '../actions/index'

// const defaultState = []

// export default function reducer(state =  defaultState, action) {

//     switch(action.type) {

//         case Actions.certificateCreatedOrUpdated:
//             const certificateIndex = state.findIndex((c: Certificate) => c.id === action.certificate.id)
//             return certificateIndex === -1 ? 
//                 [...state, action.certificate] :
//                 [...state.slice(0,certificateIndex), action.certificate, ...state.slice(certificateIndex + 1)]

//         default:
//             return state
//     }
// }

