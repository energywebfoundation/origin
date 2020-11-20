import { Configuration } from '@energyweb/utils-general';
import { IGeneralState } from '../features/general/reducer';
import { ICertificatesState } from '../features/certificates/reducer';
import { IUsersState } from '../features/users/reducer';
import { IProducingDevicesState } from '../features/producingDevices/reducer';
import { RouterState } from 'connected-react-router';
import { ethers } from 'ethers';

export interface ICoreState {
    certificatesState: ICertificatesState;
    producingDevicesState: IProducingDevicesState;
    generalState: IGeneralState;
    configurationState: Configuration.Entity;
    usersState: IUsersState;
    router: RouterState;
    web3: ethers.providers.JsonRpcProvider;
}
