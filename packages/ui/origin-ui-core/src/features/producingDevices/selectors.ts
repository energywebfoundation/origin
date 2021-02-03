import { ICoreState } from '../../types';

export const getDeviceClient = (store: ICoreState) => store.generalState.backendClient.deviceClient;
