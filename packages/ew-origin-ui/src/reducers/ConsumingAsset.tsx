// import { ConsumingAsset } from 'ewf-coo'
// import { Actions } from '../actions/index'

// const defaultState = []

// export default function reducer(state =  defaultState, action) {

//     switch (action.type) {

//         case Actions.consumingAssetCreatedOrUpdated:
//             const index = state.findIndex((c: ConsumingAsset) => c.id === action.consumingAsset.id)
//             return index === -1 ? 
//                 [...state, 
//                     action.consumingAsset] :
//                 [...state.slice(0,index),
//                     action.consumingAsset,
//                     ...state.slice(index + 1)]

//         default:
//             return state
//     }
// }

