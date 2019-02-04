import * as EwAsset from 'ew-asset-registry-lib';
import { IdentifiableEntity } from './index';

export interface ProducingAssetData extends IdentifiableEntity {
    offChainProperties: EwAsset.ProducingAsset.OffChainProperties;
    onChainProperties: EwAsset.ProducingAsset.OnChainProperties;
}

export interface RegisterProducingAssetAction {
    type: RegisterProducingAssetActionType;
    data: ProducingAssetData;
}

export enum RegisterProducingAssetActionType {
    RegisterProducingAsset = 'REGISTER_PRODUCING_ASSET',
}

export const producingAssetDataToEntity = (producingAssetData: ProducingAssetData): EwAsset.ProducingAsset.Entity => {
    const asset = new EwAsset.ProducingAsset.Entity(producingAssetData.id, null);
    asset.offChainProperties = producingAssetData.offChainProperties;

    Object.keys(producingAssetData.onChainProperties)
        .forEach((key: string) => asset[key] = producingAssetData.onChainProperties[key]);
    return asset;

};
