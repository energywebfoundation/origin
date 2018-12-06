// import { Demand } from 'ewf-coo'
// import { Actions } from '../actions/index'

// const defaultState = []

// export default function reducer(state =  defaultState, action) {

//     switch (action.type) {

//         case Actions.demandCreatedOrUpdated:
//             const demandIndex = state.findIndex((d: Demand) => d.id === action.demand.id)
//             return demandIndex === -1 ? 
//                 [...state,
//                     action.demand] :
//                 [...state.slice(0, demandIndex),
//                     action.demand, 
//                     ...state.slice(demandIndex + 1)]

//         default:
//             return state
//     }
// }

