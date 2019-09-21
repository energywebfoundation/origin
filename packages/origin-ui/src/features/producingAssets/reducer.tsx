import { ProducingAssetsActions, IProducingAssetsAction } from './actions';
import { ProducingAsset } from '@energyweb/asset-registry';

export interface IProducingAssetsState {
    producingAssets: ProducingAsset.Entity[];
}

const defaultState: IProducingAssetsState = {
    producingAssets: []
};

export default function reducer(
    state = defaultState,
    action: IProducingAssetsAction
): IProducingAssetsState {
    switch (action.type) {
        case ProducingAssetsActions.producingAssetCreatedOrUpdated:
            const index: number = state.producingAssets.findIndex(
                (c: ProducingAsset.Entity) => c.id === action.producingAsset.id
            );

            return {
                producingAssets:
                    index === -1
                        ? [...state.producingAssets, action.producingAsset]
                        : [
                              ...state.producingAssets.slice(0, index),
                              action.producingAsset,
                              ...state.producingAssets.slice(index + 1)
                          ]
            };

        default:
            return state;
    }
}
