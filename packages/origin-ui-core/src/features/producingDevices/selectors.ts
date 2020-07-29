import { IStoreState } from '../../types';

export const getDeviceClient = (store: IStoreState) =>
    store.general.offChainDataSource.deviceClient;
