import { ISupplyState, ISupplyAction } from './types';
import { SupplyActions } from './actions';

const initialState: ISupplyState = {
    supplies: null
};

export function supplyState(
    state: ISupplyState = initialState,
    { type, payload }: ISupplyAction
): ISupplyState {
    switch (type) {
        case SupplyActions.STORE_SUPPLIES:
            return {
                ...state,
                supplies: payload
            };
        default:
            return state;
    }
}
