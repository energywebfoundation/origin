import { IOriginDevice } from '../types';

export const getDeviceGridOperatorText = (device: IOriginDevice) =>
  device?.gridOperator?.split(';')?.join(' ') || '';
