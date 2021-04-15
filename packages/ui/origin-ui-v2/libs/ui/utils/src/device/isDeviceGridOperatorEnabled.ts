import { IEnvironment } from './../types';

export function isDeviceGridOperatorEnabled(environment: IEnvironment) {
  return environment?.DEVICE_PROPERTIES_ENABLED?.includes('GRID_OPERATOR');
}
