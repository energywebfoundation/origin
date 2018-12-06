// import { ProducingAsset } from 'ewf-coo'
// import { Actions } from '../actions/index'

// const defaultState = []

// export default function reducer(state =  defaultState, action) {

//     switch(action.type) {

//         case Actions.producingAssetCreatedOrUpdated:
//             const index = state.findIndex((c: ProducingAsset) => c.id === action.producingAsset.id)
//             return index === -1 ? 
//                 [...state, action.producingAsset] :
//                 [...state.slice(0,index),
//                     action.producingAsset,
//                     ...state.slice(index + 1)]

//         default:
//             return state
//     }
// }

