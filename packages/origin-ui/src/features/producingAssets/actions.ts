import { ProducingAsset } from '@energyweb/asset-registry';

export enum ProducingAssetsActions {
    producingAssetCreatedOrUpdated = 'PRODUCING_ASSET_CREATED_OR_UPDATED'
}

export interface IProducingAssetCreatedOrUpdatedAction {
    type: ProducingAssetsActions.producingAssetCreatedOrUpdated;
    producingAsset: ProducingAsset.Entity;
}

export const producingAssetCreatedOrUpdated = (producingAsset: ProducingAsset.Entity) => ({
    type: ProducingAssetsActions.producingAssetCreatedOrUpdated,
    producingAsset
});

export type TProducingAssetCreatedOrUpdated = typeof producingAssetCreatedOrUpdated;

export type IProducingAssetsAction = IProducingAssetCreatedOrUpdatedAction;
