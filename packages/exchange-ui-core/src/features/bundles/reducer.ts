import { Bundle } from '../../utils/exchange';
import { IBundleAction, BundlesActionType } from './actions';

export interface IBundlesState {
    bundles: Bundle[];
    showBundleDetails: boolean;
}

const initialState: IBundlesState = {
    bundles: [],
    showBundleDetails: false
};

export function bundlesState<T>(
    state: IBundlesState = initialState,
    { type, payload }: IBundleAction
): IBundlesState {
    switch (type) {
        case BundlesActionType.STORE:
            const bundles = [...state.bundles.filter((b) => b.id !== payload.id)];
            bundles.push(payload);
            return {
                ...state,
                bundles
            };
        case BundlesActionType.SHOW_DETAILS:
            return {
                ...state,
                showBundleDetails: payload
            };
        case BundlesActionType.CLEAR_BUNDLES:
            return {
                ...state,
                bundles: []
            };
        default:
            return state;
    }
}
