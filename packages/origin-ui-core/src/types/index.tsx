import { Issuer, Registry } from '@energyweb/issuer';
import { Configuration } from '@energyweb/utils-general';
import { IGeneralState } from '../features/general/reducer';
import { IContractsState } from '../features/contracts/reducer';
import { ICertificatesState } from '../features/certificates/reducer';
import { IUsersState } from '../features/users/reducer';
import { IProducingDevicesState } from '../features/producingDevices/reducer';
import { RouterState } from 'connected-react-router';
import { IAuthenticationState } from '../features/authentication/reducer';

export interface IStoreState {
    authentication: IAuthenticationState;
    configuration: Configuration.Entity<Registry, Issuer>;
    producingDevices: IProducingDevicesState;
    certificates: ICertificatesState;
    general: IGeneralState;
    contracts: IContractsState;
    users: IUsersState;
    router: RouterState;
}
