// import { Certificate, Demand, ProducingAsset, ConsumingAsset, User } from 'ewf-coo'
// import { Web3Service} from '../utils/Web3Service'
import * as General from 'ew-utils-general-lib';
import * as EwAsset from 'ew-asset-registry-lib'; 
import * as EwUser from 'ew-user-registry-lib';
import * as OriginIssuer from 'ew-origin-lib';

export enum Actions {
    certificateCreatedOrUpdated = 'CERTIFICATE_CREATED_OR_UPDATED',
    demandCreatedOrUpdated = 'DEMAND_CREATED_OR_UPDATED',
    producingAssetCreatedOrUpdated = 'PRODUCING_ASSET_CREATED_OR_UPDATED',
    consumingAssetCreatedOrUpdated = 'CONSUMING_ASSET_CREATED_OR_UPDATED',
    currentUserUpdated = 'CURRENT_USER_UPDATED',
    configurationUpdated = 'CONFIGURATION_UPDATED'

}

export const certificateCreatedOrUpdated = (certificate: OriginIssuer.Certificate.Entity): any => ({
    type: Actions.certificateCreatedOrUpdated,
    certificate
});

// export const demandCreatedOrUpdated= (demand: Demand) => ({
//     type: Actions.demandCreatedOrUpdated,
//     demand
// })

export const producingAssetCreatedOrUpdated = (producingAsset: EwAsset.ProducingAsset.Entity): any => ({
    type: Actions.producingAssetCreatedOrUpdated,
    producingAsset
});

export const consumingAssetCreatedOrUpdated = (consumingAsset: EwAsset.ConsumingAsset.Entity) => ({
    type: Actions.consumingAssetCreatedOrUpdated,
    consumingAsset
});

export const currentUserUpdated = (user: EwUser.User): any => ({
    type: Actions.currentUserUpdated,
    user
});

export const configurationUpdated = (conf: General.Configuration.Entity): any => ({
    type: Actions.configurationUpdated,
    conf
});