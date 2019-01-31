import * as EwfCoo from 'ewf-coo'
import { IdentifiableEntity } from './index';

export interface ProducingAssetData extends EwfCoo.ProducingAssetProperties, IdentifiableEntity {
    
}

export interface RegisterProducingAssetAction {
    type: RegisterProducingAssetActionType,
    data: ProducingAssetData
}

export enum RegisterProducingAssetActionType {
    RegisterProducingAsset = "REGISTER_PRODUCING_ASSET"
}
