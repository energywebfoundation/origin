import {
    ProducingAsset,
    ConsumingAsset,
    AssetConsumingRegistryLogic,
    AssetProducingRegistryLogic
} from '@energyweb/asset-registry';
import { User, UserLogic } from '@energyweb/user-registry';
import { Certificate, CertificateLogic } from '@energyweb/origin';
import { Configuration } from '@energyweb/utils-general';
import { Demand, MarketLogic } from '@energyweb/market';
import { IGeneralState } from '../features/general/reducer';
import { IContractsState } from '../features/contracts/reducer';
import { RouterState } from 'connected-react-router';

export interface IStoreState {
    configuration: Configuration.Entity<
        MarketLogic,
        AssetProducingRegistryLogic,
        AssetConsumingRegistryLogic,
        CertificateLogic,
        UserLogic
    >;
    producingAssets: ProducingAsset.Entity[];
    consumingAssets: ConsumingAsset.Entity[];
    certificates: Certificate.Entity[];
    demands: Demand.Entity[];
    currentUser: User.Entity;
    general: IGeneralState;
    contracts: IContractsState;
    router: RouterState;
}
