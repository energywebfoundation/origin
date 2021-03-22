import { ICoreState, IOriginDevice } from '../../types';

export const getAllDevices = (state: ICoreState): IOriginDevice[] => state.devicesState.allDevices;

export const getMyDevices = (state: ICoreState): IOriginDevice[] => state.devicesState.myDevices;
