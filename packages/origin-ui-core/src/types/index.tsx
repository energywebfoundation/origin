import { DeviceLogic, Device, ProducingDevice } from '@energyweb/device-registry';
import { UserLogic } from '@energyweb/user-registry';
import { CertificateLogic } from '@energyweb/origin';
import { Configuration } from '@energyweb/utils-general';
import { Demand, MarketLogic } from '@energyweb/market';
import { IGeneralState } from '../features/general/reducer';
import { IContractsState } from '../features/contracts/reducer';
import { ICertificatesState } from '../features/certificates/reducer';
import { IUsersState } from '../features/users/reducer';
import { IProducingDevicesState } from '../features/producingDevices/reducer';
import { RouterState } from 'connected-react-router';
import { IAuthenticationState } from '../features/authentication/reducer';

export interface IStoreState {
    authentication: IAuthenticationState;
    configuration: Configuration.Entity<MarketLogic, DeviceLogic, CertificateLogic, UserLogic>;
    producingDevices: IProducingDevicesState;
    certificates: ICertificatesState;
    demands: Demand.Entity[];
    general: IGeneralState;
    contracts: IContractsState;
    users: IUsersState;
    router: RouterState;
}

export interface ISmartMeterReadingsAdapter {
    getSmartMeterReads(device: ProducingDevice.Entity): Promise<Device.ISmartMeterRead[]>;
}