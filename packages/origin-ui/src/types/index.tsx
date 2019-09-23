import {
    ConsumingAsset,
    AssetConsumingRegistryLogic,
    AssetProducingRegistryLogic
} from '@energyweb/asset-registry';
import { UserLogic } from '@energyweb/user-registry';
import { CertificateLogic } from '@energyweb/origin';
import { Configuration } from '@energyweb/utils-general';
import { Demand, MarketLogic } from '@energyweb/market';
import { IGeneralState } from '../features/general/reducer';
import { IContractsState } from '../features/contracts/reducer';
import { ICertificatesState } from '../features/certificates/reducer';
import { IUsersState } from '../features/users/reducer';
import { IProducingAssetsState } from '../features/producingAssets/reducer';
import { RouterState } from 'connected-react-router';

export interface IStoreState {
    configuration: Configuration.Entity<
        MarketLogic,
        AssetProducingRegistryLogic,
        AssetConsumingRegistryLogic,
        CertificateLogic,
        UserLogic
    >;
    producingAssets: IProducingAssetsState;
    consumingAssets: ConsumingAsset.Entity[];
    certificates: ICertificatesState;
    demands: Demand.Entity[];
    general: IGeneralState;
    contracts: IContractsState;
    users: IUsersState;
    router: RouterState;
}
