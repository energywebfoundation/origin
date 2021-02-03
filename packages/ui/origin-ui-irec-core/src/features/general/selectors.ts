import { IEnvironment } from '@energyweb/origin-ui-core';
import { IIRecAppState } from '../../types';
import { DeviceClient } from '../../utils/client';

export const getEnvironment = (state: IIRecAppState): IEnvironment =>
    state.iRecGeneralState.environment;

export const getDeviceClient = (state: IIRecAppState): DeviceClient =>
    state.iRecGeneralState.deviceClient;
