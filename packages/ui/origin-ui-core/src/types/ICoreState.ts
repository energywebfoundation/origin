import { RouterState } from 'connected-react-router';
import { IGeneralState } from '../features/general/reducer';
import { IUsersState } from '../features/users/reducer';
import { ICertificatesState } from '../features/certificates/reducer';
import { IProducingDevicesState } from '../features/devices/reducer';
import { IConfigurationState } from '../features/configuration/types';
import { IWeb3State } from '../features/web3/types';

export interface ICoreState {
    router: RouterState;
    generalState: IGeneralState;
    usersState: IUsersState;
    certificatesState: ICertificatesState;
    producingDevicesState: IProducingDevicesState;
    configurationState: IConfigurationState;
    web3State: IWeb3State;
}
