import { Configuration } from '@energyweb/utils-general';
import { IGeneralState } from '../features/general/reducer';
import { ICertificatesState } from '../features/certificates/reducer';
import { IUsersState } from '../features/users/reducer';
import { IProducingDevicesState } from '../features/producingDevices/reducer';
import { RouterState } from 'connected-react-router';

export interface IStoreState {
    configuration: Configuration.Entity;
    producingDevices: IProducingDevicesState;
    certificates: ICertificatesState;
    general: IGeneralState;
    users: IUsersState;
    router: RouterState;
}
