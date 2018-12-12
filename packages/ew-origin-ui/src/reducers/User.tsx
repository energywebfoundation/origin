import { Actions } from '../actions/index';

const defaultState = null

export default function reducer(state =  defaultState, action) {

    switch (action.type) {
        
        case Actions.currentUserUpdated:
            return action.user;
        default:
            return state;
    }
}