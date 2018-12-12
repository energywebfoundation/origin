
import { Actions } from '../actions/index';
import * as General from 'ew-utils-general-lib';

const defaultState = null;

export default function reducer(state = defaultState, action) {
   

    switch (action.type) {

        case Actions.configurationUpdated:
            return action.conf;

        default:
            return state;
    }
}