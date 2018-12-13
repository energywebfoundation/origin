// import { Web3Service } from '../utils/Web3Service'
// import { ProducingAsset, Certificate, Demand, User, EventHandlerManager, ContractEventHandler, ConsumingAsset } from 'ewf-coo'
import * as General from 'ew-utils-general-lib';
import * as EwAsset from 'ew-asset-registry-lib'; 
import * as OriginIssuer from 'ew-origin-lib';
import * as Market from 'ew-market-lib';
import * as EwUser from 'ew-user-registry-lib';

export interface StoreState {
    configuration: General.Configuration.Entity;
    producingAssets: EwAsset.ProducingAsset.Entity[];
    consumingAssets: EwAsset.ConsumingAsset.Entity[];
    certificates: OriginIssuer.Certificate.Entity[];
    demands: Market.Demand.Entity[];
    currentUser: EwUser.User;
}

export interface Actions {
    certificateCreatedOrUpdated: Function;
    currentUserUpdated: Function;
    consumingAssetCreatedOrUpdated: Function;
    demandCreatedOrUpdated: Function;
    producingAssetCreatedOrUpdated: Function;
    configurationUpdated: Function;
}
