// import { Web3Service } from '../utils/Web3Service'
// import { ProducingAsset, Certificate, Demand, User, EventHandlerManager, ContractEventHandler, ConsumingAsset } from 'ewf-coo'
import * as General from 'ew-utils-general-lib';
import * as EwAsset from 'ew-asset-registry-lib'; 

export interface StoreState {
    // web3Service: Web3Service,
    conf: General.Configuration.Entity;
    producingAssets: EwAsset.ProducingAsset.Entity[];
    // consumingAssets: ConsumingAsset[];
    // certificates: Certificate[];
    // demands: Demand[];
    // currentUser: User;
}

export interface Actions {
    certificateCreatedOrUpdated: Function;
    currentUserUpdated: Function;
    consumingAssetCreatedOrUpdated: Function;
    demandCreatedOrUpdated: Function;
    producingAssetCreatedOrUpdated: Function;
    configurationUpdated: Function;
}
