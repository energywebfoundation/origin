import { RouterState } from 'connected-react-router';
import { IGeneralState } from '../features/general/reducer';
import { IUsersState } from '../features/users/reducer';
import { ICertificatesState } from '../features/certificates/reducer';
import { IDeviceState } from '../features/devices';
import { IConfigurationState } from '../features/configuration';
import { IWeb3State } from '../features/web3';

export interface ICoreState {
    router: RouterState;
    generalState: IGeneralState;
    usersState: IUsersState;
    certificatesState: ICertificatesState;
    devicesState: IDeviceState;
    configurationState: IConfigurationState;
    web3State: IWeb3State;
}
